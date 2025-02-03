let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minute = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
    const formattedMinutes = String(minute).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    //show all the name 
    let songUL = document.querySelector(".songList").getElementsByTagName('ul')[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class = "invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Song Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class = "invert" src="img/play.svg" alt="">
                            </div></li>`;
    }
    // Attach event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', (elemetn) => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML)
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `./${currFolder}/${track}`
    if (!pause) {
        play.src = "pause.svg"
        currentSong.play()
    }
    document.querySelector(".songinfo").innerHTML = `${decodeURI(track)}`
    document.querySelector(".songtime").innerHTML = `00:00 / 00:00`
}

async function displayAlbum() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchor)
    for (let index = 1; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]
            //Get meta data of folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.png" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true)

    //Display all the album on the page
    displayAlbum()

    //Attach event Listner to play, next and previous
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector('.circle').style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`
    })

    //add event listner to seek bar
    document.querySelector(".seekbar").addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = `${percent}%`
        currentSong.currentTime = currentSong.duration * percent * 0.01
    })

    //Add event listner for hamburger
    document.querySelector(".hamburger").addEventListener('click', () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add event listner for close
    document.querySelector(".close").addEventListener('click', () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //Add event listner to previous and next
    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index - 1) > (0)) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index + 1) < (songs.length)) {
            playMusic(songs[index + 1])
        }
    })

    //Add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener('change', (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //Add event listner to mute the track
    document.querySelector(".volume img").addEventListener('click', e=>{
        if (e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main();