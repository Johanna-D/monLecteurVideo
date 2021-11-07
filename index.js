
import './lib/webaudio-controls.js';

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

let style = `
html {
    background-color: brown;
}


#infos {
    width:100%;
    height: 30%;
    margin: 0 auto;
    text-align: center;
}

#videoDiv, #commandesDiv, #audioDiv, #ondeDiv {
    background-color: burlywood;
    width: 30%;
    box-shadow: 0px 0px 8px black;
    
}
#videoDiv {
    margin: 0 auto;
    text-align: center;
}
#commandesDiv, #audioDiv, #ondeDiv {
    float:left;
    height : 100%;
    margin: 1%;
    
}
h1 {
    font-size : 20px;
    background-color : rgba(165, 42, 42, 0.555);
    text-align: center;
}
`;
let template = /*html*/`
  <div id="videoDiv">
  <video id="player"  >
      <br>
  </video>
  
  <p><span id="currentTime">0</span><span> / </span><span id="duree"></span></p>
  
  <button id="play">PLAY</button>
  <button id="pause">PAUSE</button>
  </div>
  <br>


  <div id="infos">


  <div id="commandesDiv">
  <h1>Commandes vidéo</h1>
  <button id="avance10">Avancer</button>
  <button id="recule10">Reculer</button>
  <webaudio-switch id="speed" src="./assets/switch_toggle.png" 
    width="64" height="64"> Accélérer
  </webaudio-switch>
  <webaudio-switch id="slow" src="./assets/switch_toggle.png" 
    width="64" height="64"> Ralentir
  </webaudio-switch>
  
  <webaudio-knob id="volume" min=0 max=1 value=0.5 step="0.01" 
         tooltip="%s" diameter="50" src="./assets/Aqua.png" sprites="100">Volume</webaudio-knob>

  </div>


  <div id="audioDiv">
        <h1>Egaliseur fréquences</h1>
         <div class="controls">
         <label>60Hz</label>
         <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 0);"></input>
       <output id="gain0">0 dB</output>
       </div>
       <div class="controls">
         <label>170Hz</label>
         <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 1);"></input>
     <output id="gain1">0 dB</output>
       </div>
       <div class="controls">
         <label>350Hz</label>
         <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 2);"></input>
     <output id="gain2">0 dB</output>
       </div>
       <div class="controls">
         <label>1000Hz</label>
         <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 3);"></input>
     <output id="gain3">0 dB</output>
       </div>
       <div class="controls">
         <label>3500Hz</label>
         <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 4);"></input>
     <output id="gain4">0 dB</output>
       </div>
       <div class="controls">
         <label>10000Hz</label>
         <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 5);"></input>
     <output id="gain5">0 dB</output>
       </div>

       </div>

       <div id="ondeDiv">
       <h1>Visuel fréquences</h1>
       <p> Mettre ici la wave... </p>
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

        // création de l'equalizer 
        this.creationEqualizer();
        
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

    creationEqualizer(){
        //buil an equalizer with multiple biquad filters

        var ctx = window.AudioContext || window.webkitAudioContext;
        var context = new ctx();

        var mediaElement = this.player;
        var sourceNode = context.createMediaElementSource(mediaElement);
        mediaElement.onplay = function() {
        context.resume();
        }
        // create the equalizer. It's a set of biquad Filters

        var filters = [];

            // Set filters
        [60, 170, 350, 1000, 3500, 10000].forEach(function(freq, i) {
            var eq = context.createBiquadFilter();
            eq.frequency.value = freq;
            eq.type = "peaking";
            eq.gain.value = 0;
            filters.push(eq);
        });

        // Connect filters in serie
        sourceNode.connect(filters[0]);
        for(var i = 0; i < filters.length - 1; i++) {
            filters[i].connect(filters[i+1]);
            }

        // connect the last filter to the speakers
        filters[filters.length - 1].connect(context.destination);
    }

        
    changeGain(sliderVal,nbFilter) {
        var value = parseFloat(sliderVal);
        filters[nbFilter].gain.value = value;
        
        // update output labels
        var output = document.querySelector("#gain"+nbFilter);
        output.value = value + " dB";
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
