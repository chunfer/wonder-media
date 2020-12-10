// -----> XMLHTTPREQUEST <-----
$.ajax('https://randomuser.me/api/', {
    method: 'GET',
    success: data => {
        console.log(data)
    },
    error: err => {
        console.log(err)
    }
})

fetch('https://randomuser.me/api/')
    .then(data => data.json())
    .then(user => {
        console.log('user', user.results[0].name.first)
    })
    .catch(error => {
        console.log(error)
    });
