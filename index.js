import {TurboMini} from './libs/turbomini.js';
import {defaultCtrl} from './components/default.js';
import {creatorsCtrl} from './components/creators.js';
window.app = TurboMini();
(await app.run(async app => {
  app.errorHandler = (error) => console.log(error);
  app.useHash = true;
  await app.fetchTemplates(['default', 'creators', 'index-item']);
  app.controller('default', defaultCtrl(app));
  app.controller('creators', creatorsCtrl(app));
  
  let audio, osc, osc2, mainGain, analyser, playing;
  const Analyser = (audio) => {
    const analyser = audio.createAnalyser();
    analyser.fftSize = 1024;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength)
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(200, 0, 0)';
      ctx.beginPath();
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      let i = -1;
      while(i++<bufferLength) {
        let v = dataArray[i] / 128.0;
        let y = v * canvas.height / 2;
        if(i===0)
          ctx.moveTo(x,y);
        else
          ctx.lineTo(x,y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke();
    };
    analyser.draw = draw;
    return analyser;
  }
  const Osc2Lfo = async (audio, waveForm, lfo1Freq, lfo1Mult, lfo1Offset, lfo2Freq, lfo2Mult, lfo2Offset, start=0) => {
    
    const lfo1 = audio.createOscillator();
    lfo1.frequency.setValueAtTime(lfo1Freq, start);
    const lfo1gain1 = audio.createGain();
    lfo1gain1.gain.value = lfo1Mult;
    const lfo1gain2 = audio.createGain();
    lfo1gain2.gain.value = lfo1Offset;
    lfo1.connect(lfo1gain2);
    lfo1gain2.connect(lfo1gain1.gain);
    lfo1.start(start);
    
    const lfo2 = audio.createOscillator();
    lfo2.frequency.setValueAtTime(lfo2Freq, start);
    const lfo2gain1 = audio.createGain();
    lfo2gain1.gain.value = lfo2Mult;
    const lfo2gain2 = audio.createGain();
    lfo2gain2.gain.value = lfo2Offset;
    lfo2.connect(lfo2gain2);
    lfo2gain2.connect(lfo2gain1.gain);
    lfo2.start(start);
    
    const res = await fetch(waveForm);
    const osc = audio.createBufferSource();
    osc.buffer = await audio.decodeAudioData(await res.arrayBuffer());
    osc.loop = true;
    osc.connect(lfo1gain1);
    lfo1gain1.connect(lfo2gain1);
    //lfo2gain1.connect(destination);
    osc.start(start);
    const stop = () => {
      osc.stop();
      lfo1.stop();
      lfo2.stop();
    }
    lfo2gain1.stop = stop;
    return lfo2gain1;
  };
  const Lfo = (audio, freq, mult, offset) => {
    const lfo1 = audio.createOscillator();
    lfo1.frequency.setValueAtTime(freq, start);
    const lfo1gain1 = audio.createGain();
    lfo1gain1.gain.value = mult;
    const lfo1gain2 = audio.createGain();
    lfo1gain2.gain.value = offset;
    lfo1.connect(lfo1gain2);
    lfo1gain2.connect(lfo1gain1.gain);
    lfo1.start(start);    
    return lfo1gain1;
  };
  const Osc = async (audio, options) => {
    let osc;
    lfos = options.lfos.map(lfoOptions => {
      
    })
  };
  const start = async () => {
    audio = audio || new AudioContext();
    osc = await Osc2Lfo(audio, 'export/railloop1.ogg', 3.36, .5, .2, .3, .5, .3);
    //osc2 = await Osc2Lfo(audio, 'export/blue32.wav', 3.4, .2, 0, 0.1, 1, .5);
    mainGain = audio.createGain();
    mainGain.gain.value = 0.6;
    //osc2.connect(analyser);
    let filter = audio.createBiquadFilter();
    filter.frequency.value = 500;
    filter.type = "bandpass";
    filter.gain.value = 50;
    osc.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(audio.destination);
    playing = true;
  };
  const stop = () => {
    osc.stop();
    playing = false;
    //osc2.stop();
  };
  const toggle = () => {
    if(playing) stop();
    else start();
  }
  window.toggle = toggle;
})).start();