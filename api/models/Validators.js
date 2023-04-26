// "required" non può essere trattato come gli altri validator perché è l'unico
// che deve poter essere eseguito anche se il field è undefined.
// Andrà quindi nell'apposito omonimo campo e non nell'array dei validators
const required = (field) => {
    return [true, `Il campo "${field}" non può essere assente`]
}
exports.required = required;


const isNotEmpty = function(field) {
    return {
        validator: (value) => value.length > 0,
        message: `Il campo "${field}" non può essere vuoto`
    }
}
exports.isNotEmpty = isNotEmpty;

const minVal = function(min, field) {
    return {
        validator: (value) => value >= min,
        message: `Il campo "${field}" deve essere maggiore di ${min}`
    }
}
exports.minVal = minVal;
