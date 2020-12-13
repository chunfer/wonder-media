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

        default:
          return animationList.find(movie => movie.id === Number(id));
      }
    }

    function showModal($element){
      const {id, category} = $element.dataset;
      const movie = findMovie(id, category);
      modalTitle.textContent = movie.title;
      modalImage.setAttribute('onerror','ImgError(this)')
      modalImage.setAttribute('src', movie.medium_cover_image);
      modalDescription.textContent = movie.description_full;
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
          const HTMLString = videoItemTemplate(movie, category);
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

    function featuringTemplate({medium_cover_image, title}, found = 'Pelicula encontrada'){
      return `<div class="featuring">
      <div class="featuring-image">
        <img src="${medium_cover_image}" width="70" height="100" alt="">
      </div>
      <div class="featuring-content">
        <p class="featuring-title">${found}</p>
        <p class="featuring-album">${title}</p>
      </div>
      <span class="close-featuring" onclick="closeFeaturing()">&times;<span>
    </div>`
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
      $featuringContainer.innerHTML = '';
      $featuringContainer.append($loader);
      const data = new FormData($videoForm);
      let  HTMLString;

      try {
        const {
          data: {
            movies: movieSearched
          }
        } = await getData(`${MOVIE_URL}limit=1&query_term=${data.get('name')}`);
        HTMLString = featuringTemplate(movieSearched[0]);

      } catch (error) {
        console.log(error);
        HTMLString = featuringTemplate({medium_cover_image: 'src/images/sad2.png', title: 'Lo sentimos'}, 'No se pudo encontrar tu pelicula')
      }

      $featuringContainer.innerHTML = HTMLString;
    });

    const today = new Date().getDay();
    const dayInStorage = Number(window.localStorage.getItem('day'));

    if(dayInStorage){
      if(today !== dayInStorage){
        clearListsInStorage();
      }
    }
    window.localStorage.setItem('day', today);

    let actionList, $actionContainer;
    let dramaList, $dramaContainer;
    let animationList, $animationContainer; 

    const $modal = document.getElementById('video-modal');
    const $overlay = document.getElementById('overlay');
    const $hideModal = document.getElementById('hide-video-modal');

    $hideModal.addEventListener('click', hideModal);

    const $featuringContainer = document.getElementById('featuring');

    const modalTitle = $modal.querySelector('h1');
    const modalImage = $modal.querySelector('img');
    const modalDescription = $modal.querySelector('p');

    await renderMovies();



    const $refresh = document.getElementById('refresh');
    $refresh.addEventListener('click', async () => {
      await refreshMovies();
    });

})()