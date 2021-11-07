
import './lib/webaudio-controls.js';

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

let style = `
html {
    background-color: brown;
    background: url(./assets/fond.jpg) no-repeat center fixed; 
  -webkit-background-size: cover; /* pour anciens Chrome et Safari */
  background-size: cover; /* version standardisée */
}

#player{
    width:80%;
    box-shadow: 0px 0px 5px black;
}

#videoDiv, #playlist {
    background-color: #636363;
    width: 30%;
    box-shadow: 0px 0px 8px black;
    padding-top: 20px;
    margin-top: 30px;
    height: 80%;
    overflow:auto;
    
}
#videoDiv {
    
    
    text-align: center;
    float: left;
    height: 80%;
    margin-left: 20%;
    border-top-right-radius: 80px 80px;
    border-bottom-left-radius: 80px 80px;
}
#video0,#video1, #video2, #video3 {
    width : 60%;
    margin-left: 5%;
    margin-top:3%;
    box-shadow: 0px 0px 5px black;
}
#video0:hover, #video1:hover, #video2:hover, #video3:hover {
    opacity: 0.5;
}
 #playlist {
    float:right;
    text-align: center;
    width : 20%;
    margin-right: 20%;
    overflow:auto;
    border-top-left-radius: 80px 80px;
    border-bottom-right-radius: 80px 80px;
    
    
}
h1 {
    font-size : 20px;
    background-color : #AFAFAF;
    text-align: center;
}
input:hover{
    opacity: 0.5;
}
`;
let template = /*html*/`
  <div id="videoDiv">
  <h1>Lecteur vidéo</h1>
  <video id="player" >
      
  </video>
  
  <p><span id="currentTime">0</span><span> / </span><span id="duree"></span></p>
  
  <input id="play" type="image" src="./assets/play.png"  width="48" height="48" alt="submit"/>
  <input id="pause" type="image" src="./assets/pause.png"  width="48" height="48" alt="submit"/>
  <input id="avance10" type="image" src="./assets/avancer.png"  width="48" height="48" alt="submit"/>
  <input id="recule10" type="image" src="./assets/reculer.png"  width="48" height="48" alt="submit"/>
  <br>
  <webaudio-switch id="speed" src="./assets/switch_toggle.png" 
    width="64" height="64"> Accélérer
  </webaudio-switch>
  <webaudio-switch id="slow" src="./assets/switch_toggle.png" 
    width="64" height="64"> Ralentir
  </webaudio-switch>
  
  <webaudio-knob id="volume" min=0 max=1 value=0.5 step="0.01" 
         tooltip="%s" diameter="50" src="./assets/Aqua.png" sprites="100">Volume</webaudio-knob>
  </div>
 
       <div id="playlist">
       <h1>Playlist</h1>
       <video id="video0" src="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"> </video><br>
       <video id="video1" src="./assets/chat.mp4"> </video><br>
       <video id="video2" src="./assets/nature.mp4"> </video><br>
       <video id="video3" src="./assets/musique.mp4"> </video>
       </div>

       </div>
   `;

class MyVideoPlayer extends HTMLElement {
    constructor() {
        super();


        console.log("BaseURL = " + getBaseURL());

        this.attachShadow({ mode: "open" });
    }

    fixRelativeURLs() {
        // pour les knobs
        let knobs = this.shadowRoot.querySelectorAll('webaudio-knob, webaudio-switch, webaudio-slider');
        knobs.forEach((e) => {
            let path = e.getAttribute('src');
            e.src = getBaseURL() + '/' + path;
        });
    }
    connectedCallback() {
        // Appelée avant affichage du composant
        //this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.shadowRoot.innerHTML = `<style>${style}</style>${template}`;
        
        this.fixRelativeURLs();

        this.player = this.shadowRoot.querySelector("#player");
        // récupération de l'attribut HTML
        this.player.src = this.getAttribute("src");

        // déclarer les écouteurs sur les boutons
        this.definitEcouteurs();

        
    }

    definitEcouteurs() {
        console.log("ecouteurs définis")
        this.shadowRoot.querySelector("#play").onclick = () => {
            this.play();
        }
        this.shadowRoot.querySelector("#pause").onclick = () => {
            this.pause();
        }
        this.shadowRoot.querySelector("#avance10").onclick = () => {
            this.avance10s();
        }
        this.shadowRoot.querySelector("#recule10").onclick = () => {
            this.recule10s();
        }
        this.shadowRoot.querySelector("#speed").onclick = (event) => {
            this.vitesse4x(event);
        }
        this.shadowRoot.querySelector("#slow").onclick = (event) => {
            this.slow(event);
        }
        this.shadowRoot.querySelector("#video0").onclick = (event) => {
            this.player.src = this.shadowRoot.querySelector("#video0").src;
            this.play();
        }
        this.shadowRoot.querySelector("#video1").onclick = (event) => {
            this.player.src = this.shadowRoot.querySelector("#video1").src;
            this.play();
        }
        this.shadowRoot.querySelector("#video2").onclick = (event) => {
            this.player.src = this.shadowRoot.querySelector("#video2").src;
            this.play();
        }
        this.shadowRoot.querySelector("#video3").onclick = (event) => {
            this.player.src = this.shadowRoot.querySelector("#video3").src;
            this.play();
        }

        this.shadowRoot.querySelector("#volume").oninput = (event) => {
            const vol = parseFloat(event.target.value);
            this.player.volume = vol;
        }
        this.player.ondurationchange = () => {
            this.duree();
        }
        this.player.ontimeupdate = (event) => {
            this.current();
          };
    }

    
   
    // API de mon composant
    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
    }
    avance10s() {
        this.player.currentTime += 10;
    }
    recule10s() {
        this.player.currentTime -= 10;
        
    }

    vitesse4x(event) {
        if (event.target.value) {
            this.player.playbackRate = 4;
        }
        else {
            this.player.playbackRate = 1;
        }
        
    }
    slow(event) {
        if (event.target.value) {
            this.player.playbackRate = 0.2;
        }
        else {
            this.player.playbackRate = 1;
        }
        
    }
    

    duree() {
        let minutes = "";
        let secondes = "";
        if (this.player.duration /60 < 10) {
            minutes = "0"+Math.floor(this.player.duration /60);
        }
        else {
            minutes = Math.floor(this.player.duration /60)
        }
        if (this.player.duration %60 < 10) {
            secondes = "0"+Math.floor(this.player.duration %60);
        }
        else {
            secondes = Math.floor(this.player.duration %60)
        }
        this.shadowRoot.querySelector("#duree").innerHTML =  minutes + ":"+ secondes;
    }
    current(){
        let minutes = "";
        let secondes = "";
        if (this.player.currentTime /60 < 10) {
            minutes = "0"+Math.floor(this.player.currentTime /60);
        }
        else {
            minutes = Math.floor(this.player.currentTime /60)
        }
        if (this.player.currentTime %60 < 10) {
            secondes = "0"+Math.floor(this.player.currentTime %60);
        }
        else {
            secondes = Math.floor(this.player.currentTime %60)
        }
        this.shadowRoot.querySelector("#currentTime").innerHTML =  minutes + ":"+ secondes;
    }
}

customElements.define("my-player", MyVideoPlayer);
