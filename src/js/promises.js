console.log('hola mundo!');
const noCambia = "Leonidas";

let cambia = "@LeonidasEsteban"

function cambiarNombre(nuevoNombre) {
  cambia = nuevoNombre;
}

const getUser = new Promise((allGood, allBad) => {
  try {
    setTimeout(() => {allGood('Message 2')}, 3000)

  } catch (error) {
    allBad(error)
  }
})

const getUser2 = new Promise((allGood, allBad) => {
  try {
    setTimeout(() => {allGood('Message 1')}, 2000)

  } catch (error) {
    allBad(error)
  }
})

Promise.all([getUser, getUser2])
  .then((message)=> {
    console.log(message)
  })

  .catch(error =>{
    console.log(error)
  })