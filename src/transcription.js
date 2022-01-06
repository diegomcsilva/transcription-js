// converte audio em vvt -> https://my.sonix.ai/

import {
  audioTextList,
  intervalsList,
  clearInterval
} from './utils';

const allAudiosComponentsEl = document.querySelectorAll('[data-ref]');

const transcription = (audioRef) => {
  const refEl = document.querySelector(`[data-ref=${audioRef}]`);
  const audioEl = refEl.querySelector('audio');
  const playEl = refEl.querySelector('.transcription__audio--player');
  const timerEl = refEl.querySelector('.transcription__audio--timer');
  const textEl = refEl.querySelector('.transcription__text');
  const completeTextEl = refEl.querySelector('.transcription__complete');
  const openModalEl = refEl.querySelector('.transcription__complete--button');
  const closeModalEl = refEl.querySelector('.transcription__close');
  const informationsEl = refEl.querySelector('.transcription__informations');

  const audio = audioTextList[audioRef];

  const controller = {
    indexLetter: 0,
    indexPhrase: 0,
    indexPaused: 0,
    textIsPaused: false,
    timerUnityLetter: 0,
  };

  const letterListOfObjects = [];

  const textEngine = {
    convertTextToArrayLetters: index => audio[index].text.split(''),
    
    getTimerTheString: (index, position) => audio[index].time.split(' --> ')[position].split(':')[2],

    writeTextDefault: () => {
      timerEl.max = audioEl.duration;

      audioEl.addEventListener('loadeddata', () => {
        timerEl.max = audioEl.duration;
      });

      audio.forEach(item => {
        const {
          text
        } = item

        textEl.innerHTML += `${text}`;
      });

      textEl.dataset.text = textEl.innerText;
    },

    addInformationsTheLetter: (index) => {
      const timer = (textEngine.getTimerTheString(index, 1) - textEngine.getTimerTheString(index, 0)) * 1000;

      const letterList = textEngine.convertTextToArrayLetters(index);
      const lenthLetras = letterList.length;
      const letterUnity = timer / lenthLetras;
      
      letterList.forEach(letter => {
        controller.timerUnityLetter += letterUnity;
        controller.indexLetter += 1

        letterListOfObjects[controller.indexLetter] = {
          letter,
          index: controller.indexLetter,
          timer: controller.timerUnityLetter
        }
      });
    },

    addInformationsInListTheLetters: () => {
      controller.indexPhrase = 0;

      audio
        .forEach(() => {
          textEngine.addInformationsTheLetter(controller.indexPhrase);

          controller.indexPhrase += 1
        })
    },

    writeLetter: (letter) => {
      textEl.innerHTML += letter.letter;
      textEl.scrollTo(0, textEl.clientHeight);
    },
  };

  const audioEngine = {
    positionPointer: () => {
      const {
        currentTime
      } = audioEl;
      timerEl.value = `${currentTime}`;
    },

    pauseTextAudio: () => {
      playEl.classList.remove('stop');

      controller.textIsPaused = true;

      clearInterval(intervalsList)

      audioEl.pause();
    },

    pauseAllTextAudio: event => {
      const { audioPlay } = document.querySelector('body').dataset;
      const { play } = event.target.dataset;

      if (audioPlay !== play) {
        document.querySelector('body').dataset.audioPlay = play;

        clearInterval(intervalsList);

        allAudiosComponentsEl.forEach(audioItemEl => {
          audioItemEl.querySelector('audio').pause();
          audioItemEl.querySelector('.transcription__audio--player').classList.remove('stop');
        });

      }
    },

    startTextAudio: event => {
      audioEngine.pauseAllTextAudio(event);

      playEl.classList.add('stop');

      controller.textIsPaused = false;

      const tempoJaPercorrido = letterListOfObjects
        .filter(item => item.index < controller.indexPaused)

      const hasIndexPaused = () => letterListOfObjects
        .filter(item => item.index > controller.indexPaused)
        .map(item => ({
          ...item,
          timer: item.timer - tempoJaPercorrido[tempoJaPercorrido.length - 1].timer
        }));

      const notHasIndexPaused = () => {
        textEl.innerHTML = '';
        return letterListOfObjects;
      }

      const bookTimerLetterVerified = controller.indexPaused > 0 ?
        hasIndexPaused() :
        notHasIndexPaused();

      bookTimerLetterVerified.forEach(letter => {
        intervalsList[letter.index] = setTimeout(() => {
          if (!controller.textIsPaused) {
            controller.indexPaused = letter.index;
            textEngine.writeLetter(letter);
          }
        }, letter.timer);

        // cacheTimeouts.push(intervalsList[letter.index]);
      })

      audioEl.play();
    },

    playAndStop: event => {
      audioEl.paused ? audioEngine.startTextAudio(event) : audioEngine.pauseTextAudio();
    },

    changeTimerBar: ev => {

      audioEngine.pauseTextAudio();

      const {
        value
      } = ev.target;
      const {
        duration
      } = audioEl;

      audioEl.currentTime = value;

      const percentualAtualDoAudio = (audioEl.currentTime / duration) * 100;
      const proporcionalFinalNaLista = ((percentualAtualDoAudio * letterListOfObjects.length) / 100);

      controller.indexPaused = proporcionalFinalNaLista;

      textEl.innerHTML = '';

      letterListOfObjects
        .filter(item => item.index < controller.indexPaused)
        .forEach(letter => {
          textEngine.writeLetter(letter);
        })
    },

    audioEnd: () => {
      audioEl.currentTime = 0;
      controller.indexPaused = 0;
      playEl.classList.remove('stop');
    }
  };

  const actions = {
    openModal: () => {
      completeTextEl.classList.add('carta-hide');
      informationsEl.classList.add('active-modal');
    },
    closeModal: () => {
      completeTextEl.classList.remove('carta-hide');
      informationsEl.classList.remove('active-modal');
      audioEngine.pauseTextAudio();
    },
  }

  const init = () => {
    textEngine.writeTextDefault();
  
    textEngine.addInformationsInListTheLetters();
    
    audioEl.addEventListener('timeupdate', audioEngine.positionPointer);
    audioEl.addEventListener('ended', audioEngine.audioEnd);
    timerEl.addEventListener('change', audioEngine.changeTimerBar);
    playEl.addEventListener('click', audioEngine.playAndStop);
    openModalEl.addEventListener('click', actions.openModal);
    closeModalEl.addEventListener('click', actions.closeModal);

  };

  init();
};

export default transcription;
