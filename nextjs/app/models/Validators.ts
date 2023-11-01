// "required" non può essere trattato come gli altri validator perché è l'unico
// che deve poter essere eseguito anche se il field è undefined.
// Andrà quindi nell'apposito omonimo campo e non nell'array dei validators
export const required = (field: string) => {
    return [true, `il campo "${field}" non può essere assente`]
}

export const isNotEmpty = function(field: string) {
    return {
        validator: (value:string) => value.length > 0,
        message: `il campo "${field}" non può essere vuoto`
    }
}

export const minVal = function(min: number, field: string) {
    return {
        validator: (value: number) => value >= min,
        message: `il campo "${field}" deve essere maggiore di ${min}`
    }
}
