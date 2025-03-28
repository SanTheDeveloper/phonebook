const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://sandeeproutdeveloper:${password}@cluster0.q04ob.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const addPerson = async () => {
  const person = new Person({
    name,
    number,
  })

  try {
    await person.save()
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  } catch (error) {
    console.error('add person failed:', error)
  }
}

const listPeople = async () => {
  const persons = await Person.find({})
  console.log('phonebook:')
  persons.forEach((person) => {
    console.log(`${person.name} ${person.number}`)
  })
  mongoose.connection.close()
}

if (process.argv.length === 5) {
  addPerson()
} else if (process.argv.length === 3) {
  listPeople()
} else {
  console.log('Usage: node mongo.js <password> [<name> <number>]')
  process.exit(1)
}
