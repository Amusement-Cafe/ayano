/*
* Support for starting promos and claim boosts
* Used by CLI and bot
*/

const Promo = require('../collections/promo')

const addPromo = (ctx, obj) => {

}


const questions = [
    {
        type: 'input',
        name: 'id',
        message: "Please specify the ID",
        validate: (value) => {
            if(value.length > 3)
                return true

            return 'ID should be more than 3 characters long'
        }
    }, {
        type: 'confirm',
        name: 'isboost',
        message: 'Is this a boost (not promotion)?',
        default: false
    }, {
        type: 'input',
        name: 'name',
        message: "Please specify the name (of how it would appear for users)",
        validate: (value) => {
            if(value.length > 3)
                return true

            return 'Name should be more than 3 characters long'
        }
    },
 ]

module.exports = {
    addPromo,

    questions
}