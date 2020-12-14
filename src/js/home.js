const MOVIE_URL = 'https://yts.mx/api/v2/list_movies.json?';


(async function load(){

    async function getData(url){
        const response = await fetch(url);
        const data = await response.json();
        if (data.data.movie_count > 0){
          return data;
        }
        throw new Error('Lo sentimos no encontramos tu película')
    }

    function videoItemTemplate({medium_cover_image, title, id}, category){
      return `<div class="primaryPlaylistItem" data-id=${id} data-category=${category}>
      <div class="primaryPlaylistItem-image">
        <img src="${medium_cover_image}" onerror="ImgError(this)">
      </div>
      <h4 class="primaryPlaylistItem-title">
        ${title}
      </h4>
      </div>`
    }

    function foundItemTemplate({medium_cover_image, title, id}, category){
      return `<div class="foundlistItem" data-id=${id} data-category=${category}>
      <div class="foundlistItem-image">
        <img src="${medium_cover_image}" onerror="ImgError(this)">
      </div>
      <h4 class="foundlistItem-title">
        ${title}
      </h4>
      </div>`
    }

    function createTemplate(HTMLString){
      const $html = document.implementation.createHTMLDocument();
      $html.body.innerHTML = HTMLString;
      return $html.body.children[0];
    }

    function addEventClick($element){
      $element.addEventListener('click', () => {
        showModal($element);
      });
      // JQUERY
      // $('.div').on('click', () => {alert('click')})
    }

    function findMovie(id, category){
      switch (category) {
        case 'action':
          return actionList.find(movie => movie.id === Number(id));

        case 'drama':
          return dramaList.find(movie => movie.id === Number(id));

        case 'animation':
          return animationList.find(movie => movie.id === Number(id));
        
        default:
          return foundList.find(movie => movie.id === Number(id));
      }
    }

    function showModal($element){
      const {id, category} = $element.dataset;
      const movie = findMovie(id, category);
      modalTitle.textContent = movie.title;
      modalImage.setAttribute('onerror','ImgError(this)')
      modalImage.setAttribute('src', movie.medium_cover_image);
      modalDescription.textContent = movie.description_full;
      downloadLink = movie.torrents[0].url;
      $overlay.classList.add('active');
      $modal.style.animation = 'modalIn .8s forwards';
      // $element.querySelector('p').textContent= '';
    }

    function hideModal(){
      $overlay.classList.remove('active');
      $modal.style.animation = 'modalOut .8s forwards';
    }

    function renderMovieList(list, $container, category){
      $container.children[0].remove();
      list.forEach(async movie => {
        let HTMLString;
        if(category === 'found'){
          HTMLString = foundItemTemplate(movie, category);
        } else {
          HTMLString = videoItemTemplate(movie, category);
        }

          const movieElement = createTemplate(HTMLString);
          $container.append(movieElement);
          // const image = movieElement.querySelector('img');
          // image.addEventListener('load', event => {
          //   event.target.classList.add('fadeIn')
          // });
          // movieElement.classList.add('fadeIn');
          addEventClick(movieElement);
        })
    }

    function setAttributes($element, attributes){
      for(const attribute in attributes){
        $element.setAttribute(attribute, attributes[attribute]);
      }
    }

    async function cacheExist(category){
      const listName = `${category}List`;
      const cacheList = window.localStorage.getItem(listName);
    
      if (cacheList){
        const list = JSON.parse(cacheList);
        return list;
      }
      
      const {data: {movies: list}} = await getData(`${MOVIE_URL}genre=${category}`);
      window.localStorage.setItem(listName, JSON.stringify(list));
      return list;
    }

    function clearListsInStorage(){
      window.localStorage.removeItem('actionList');
      window.localStorage.removeItem('dramaList');
      window.localStorage.removeItem('animationList');
    }

    function clearContainers(){
      $actionContainer.innerHTML = `<img src="src/images/loader.gif" width="50" height="50" alt="">`;
      $dramaContainer.innerHTML = `<img src="src/images/loader.gif" width="50" height="50" alt="">`;
      $animationContainer.innerHTML = `<img src="src/images/loader.gif" width="50" height="50" alt="">`;
    }

    async function refreshMovies(){
      clearContainers();
      clearListsInStorage();
      await renderMovies();
    }

    async function renderMovies(){
      actionList = await cacheExist('action');
      $actionContainer = document.querySelector('#action');
      renderMovieList(actionList, $actionContainer, 'action');
  
      dramaList = await cacheExist('drama');
      $dramaContainer = document.getElementById('drama');
      renderMovieList(dramaList, $dramaContainer, 'drama');
  
      animationList = await cacheExist('animation');
      $animationContainer = document.getElementById('animation');
      renderMovieList(animationList, $animationContainer, 'animation');
    }

    function hrefLink(){
      location.href = downloadLink;
    }

    const today = new Date().getDay();
    const dayInStorage = Number(window.localStorage.getItem('day'));

    if(dayInStorage){
      console.log('Hey');
      if(today !== dayInStorage){
        console.log('Jude');
        clearListsInStorage();
      }
    }

    window.localStorage.setItem('day', today);

    const $home = document.getElementById('home');
    const $videoForm = document.getElementById('video-form');

    $videoForm.addEventListener('submit', async event => {
      event.preventDefault();
      $home.classList.add('search-active');
      const $loader = document.createElement('img');
      setAttributes($loader, {
        src: 'src/images/loader.gif',
        height: 50,
        width: 50
      })
      $foundContainer.innerHTML = '';
      $foundContainer.append($loader);
      const data = new FormData($videoForm);

      try {
        const {data: {movies: foundListTemp}} = await getData(`${MOVIE_URL}query_term=${data.get('name')}`);
        foundList = foundListTemp;
        renderMovieList(foundList, $foundContainer, 'found')

      } catch (error) {
        console.log(error);
        $foundContainer.innerHTML = `<h3>Lo sentimos, no pudimos encontrar niguna película</h3>` 
      }
    });



    let actionList, $actionContainer;
    let dramaList, $dramaContainer;
    let animationList, $animationContainer; 

    const $modal = document.getElementById('video-modal');
    const $overlay = document.getElementById('overlay');
    const $hideModal = document.getElementById('hide-video-modal');

    $hideModal.addEventListener('click', hideModal);

    let foundList;
    const $foundContainer = document.getElementById('found');

    const modalTitle = $modal.querySelector('h1');
    const modalImage = $modal.querySelector('img');
    const modalDescription = $modal.querySelector('p');

    await renderMovies();

    let downloadLink = '#';

    const $downloadButton = document.getElementById('download-torrent');
    
    $downloadButton.addEventListener('click', hrefLink);

    const $refresh = document.getElementById('refresh');
    $refresh.addEventListener('click', async () => {
      await refreshMovies();
    });

})()