const OAuth2Strategy = require('passport-oauth2')

const User = require('./models/User')
  
class UnipiAuthStrategy extends OAuth2Strategy {
  constructor(options) {
    super({...options, scope: "openid"}, (accessToken, refreshToken, params, profile, cb) => {
      console.log(`oauth2 verify: accessToken ${accessToken} refreshToken: ${refreshToken} profile: ${profile} params: ${params}`)
      console.log(`params: ${JSON.stringify(params)}`)
      console.log(`profile: ${JSON.stringify(profile)}`)
      const username = profile[options.usernameField]
      console.log(`username: ${username}`)
    
      if (! username) throw new Error("invalid username")
    
      async function update() {
        let user = null
        try {
          user = await User.findOneAndUpdate({ username: username }, {
          $set: {
              username: username, 
              first_name: profile?.given_name,
              last_name: profile?.family_name,
              email: profile?.email,
              id_number: profile?.unipiMatricolaStudente || profile?.unipiMatricolaDipendente || profile?.credential || profile?.principal || profile?.sub,
            }
          }, {
            upsert: true,
            new: true
          })
          user.oauth2 = {accessToken, refreshToken}
          cb(null, user)
        } catch (err) {
          cb(err,null)
        }
      }

      update()
    })
  }

  userProfile(accesstoken, done) {
    // abilita questo se vuoi vedere lo "scope" del token.
    if (false) return done(null, {}) 
  
    console.log(`accesstoken: ${accesstoken}`)
    // choose your own adventure, or use the Strategy's oauth client
    this._oauth2._request("GET", process.env.OAUTH2_USERINFO_URL, null, null, accesstoken, (err, data) => {
      if (err) { return done(err) }
      console.log(`DATA: ${data}`)
      try {
          data = JSON.parse( data )
      }
      catch(e) {
        return done(e)
      }
      done(null, data)
    })
  }
}

module.exports = UnipiAuthStrategy
