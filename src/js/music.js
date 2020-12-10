const MUSIC_URL = 'https://www.theaudiodb.com/api/v1/json/1/';
const YOUTUBE_URL = 'https://www.youtube.com/';

(async function load_music() {
    async function getData(url){
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    async function getArtist(artistName){
        const artistFormatted = artistName.replace(' ', '_')
        const artist = await getData(`${MUSIC_URL}search.php?s=${artistFormatted.toLowerCase()}`);
        return artist.artists[0];
    }

    async function getMusicVideos({idArtist}){
        const mVids = await getData(`${MUSIC_URL}mvid.php?i=${idArtist}`);
        return mVids.mvids;
    }

    function setAttributes($element, attributes){
        for(const attribute in attributes){
            $element.setAttribute(attribute, attributes[attribute]);
        }
    }

    function showArtistModal({strArtist ,strArtistThumb, strBiographyES}){
        artistModalTitle.textContent = strArtist;
        artistModalImage.setAttribute('src', strArtistThumb);
        artistModalDescription.textContent = strBiographyES;
        $overlay.classList.add('active');
        $artistModal.style.animation = 'modalIn .8s forwards';
    }

    function showMusicModal($element){
        const {vid, song} = $element.dataset;
        const {strArtist, strArtistClearart} = artist;
        $youtubeLink.setAttribute('href', `${YOUTUBE_URL}watch?v=${vid}`)
        $youtubeVideo.setAttribute('src', `${YOUTUBE_URL}embed/${vid}`)
        $musicModalImage.setAttribute('src', strArtistClearart)
        $musicModalTitle.textContent = `${strArtist} - ${song}`;
        $overlay.classList.add('active');
        $musicModal.style.animation = 'modalIn .8s forwards';
    }

    function hideArtistModal(){
        $overlay.classList.remove('active');
        $artistModal.style.animation = 'modalOut .8s forwards';
    }

    function hideMusicModal(){
        $overlay.classList.remove('active');
        $musicModal.style.animation = 'modalOut .8s forwards';
    }

    function addEventClick($element){
        $element.addEventListener('click', () => {
          showMusicModal($element);
        });
        // JQUERY
        // $('.div').on('click', () => {alert('click')})
      }

    function myPlayListItemTemplate({strMusicVid, strTrack}){
        const vid = strMusicVid.slice(strMusicVid.indexOf('=') + 1)
        return `<li class="myPlaylist-item" data-vid="${vid}" data-song="${strTrack}">
        <span>
            ${strTrack}
        </span>
      </li>`
    }

    function createTemplate(HTMLString){
        const $html = document.implementation.createHTMLDocument();
        $html.body.innerHTML = HTMLString;
        return $html.body.children[0];
    }

    function toggleMusicContent(){
        if(musicFlag){
            $musicBtn.innerHTML = '<i class="fa fa-angle-down"></i>';
            $sidebarContent.style.animation = 'musicOut .8s forwards';
        }else{
            $musicBtn.innerHTML = '<i class="fa fa-angle-up"></i>';
            $sidebarContent.style.animation = 'musicIn .8s forwards';
        }
        musicFlag = !musicFlag;
    }
    let musicFlag = false;
    const $sidebarContent = document.getElementById('sidebar-content');
    const $musicBtn = document.getElementById('music-btn');

    $musicBtn.addEventListener('click', toggleMusicContent);

    const $musicForm = document.getElementById('music-form');
    const $playlistTitle = document.getElementById('myPlaylist-title');
    const $myPlaylistContainer = document.getElementById('myPlaylist');
    let artist, videos;
    const $overlay = document.getElementById('overlay');

    const $artistModal = document.getElementById('artist-modal');
    const artistModalTitle = $artistModal.querySelector('h1');
    const artistModalImage = $artistModal.querySelector('img');
    const artistModalDescription = $artistModal.querySelector('p');
    const $hideArtistModal = document.getElementById('hide-artist-modal');

    const $musicModal = document.getElementById('music-modal');
    const $musicModalTitle = document.getElementById('song-title');
    const $musicModalImage = document.getElementById('artist-img');
    const $youtubeVideo = document.getElementById('youtube-video');
    const $youtubeLink = document.getElementById('youtube-link');
    const $hideMusicModal = document.getElementById('hide-music-modal');

    $hideArtistModal.addEventListener('click', hideArtistModal)
    $hideMusicModal.addEventListener('click', hideMusicModal)

    $musicForm.addEventListener('submit', async event => {
        event.preventDefault();
        $playlistTitle.textContent = '';
        const $loader = document.createElement('img');
        setAttributes($loader, {
          src: 'src/images/loader.gif',
          height: 50,
          width: 50
        })

        $myPlaylistContainer.innerHTML = '';
        $myPlaylistContainer.append($loader);
        const data = new FormData($musicForm);
        let  HTMLString = '';
  
        try {
            artist = await getArtist(data.get('artist'));
            videos = await getMusicVideos(artist);
            $playlistTitle.textContent = artist.strArtist;
            $playlistTitle.addEventListener('click', () =>{showArtistModal(artist)})
            
            videos.forEach(video => {
                HTMLString = myPlayListItemTemplate(video);
                $songElement = createTemplate(HTMLString);
                addEventClick($songElement);

                $myPlaylistContainer.append($songElement);
            });
            $myPlaylistContainer.children[0].remove()
  
        } catch (error) {
            console.log(error);
            HTMLString = `<p>No se encontró el resultado. Verifique si el nombre de la banda o artista está bien escrito<p>`;
            $myPlaylistContainer.innerHTML = HTMLString;
        }
      });

})()