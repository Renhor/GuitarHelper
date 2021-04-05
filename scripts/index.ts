enum Tone {
  Full = 2,
  Half = 1,
}

type Note = {
  rus: 'До' | 'Ре' | 'Ми' | 'Фа' | 'Соль' | 'Ля' | 'Си';
  int: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  toneNext: Tone;
  halfTone?: "b" | "#";
};

type GuitarString = 1 | 2 | 3 | 4 | 5 | 6;

type GuitarNotesString = {
  [key in GuitarString]: Note;
};

interface IGuitarNotesConfig {
  frets?: number;
  strings?: number;
  maxFretGenerate?: number;
  element: Node;
}

interface INotePosition {
  string: number;
  fret: number;
}

type IGuitarNotesConfigDefault = Omit<IGuitarNotesConfig, 'element'>;

class GuitarNotes {
  private notes: Array<Note> = [
    { rus: 'До', int: 'C', toneNext: Tone.Full },
    { rus: 'Ре', int: 'D', toneNext: Tone.Full },
    { rus: 'Ми', int: 'E', toneNext: Tone.Half },
    { rus: 'Фа', int: 'F', toneNext: Tone.Full },
    { rus: 'Соль', int: 'G', toneNext: Tone.Full },
    { rus: 'Ля', int: 'A', toneNext: Tone.Full },
    { rus: 'Си', int: 'B', toneNext: Tone.Half },
  ];
  private guitarNotes: GuitarNotesString = {
    1: this.notes.find((n) => n.rus === 'Ми'),
    2: this.notes.find((n) => n.rus === 'Си'),
    3: this.notes.find((n) => n.rus === 'Соль'),
    4: this.notes.find((n) => n.rus === 'Ре'),
    5: this.notes.find((n) => n.rus === 'Ля'),
    6: this.notes.find((n) => n.rus === 'Ми'),
  };
  private defaultConfig: IGuitarNotesConfigDefault = {
    strings: 6,
    frets: 21,
    maxFretGenerate: 21,
  };
  private config: IGuitarNotesConfig;

  constructor(config: IGuitarNotesConfig) {
    this.config = { ...this.defaultConfig, ...config };
  }

  initialize(): GuitarNotes {
    return this;
  }

  generateRandNote(maxFret?: number, maxString?: number): INotePosition {
    return {
      string: this.randString(maxString),
      fret: this.randFrets(maxFret),
    };
  }

  getNoteName(stringNum: GuitarString ): string {
    const { rus, int } = this.guitarNotes[stringNum];

    return `${int} (${rus})`;
  }

  findFinalNote(randomNote: INotePosition): Note {
    // 3 5 = До =
    // 3 1 = Соль #
    // 5 7 = Ми
    let currentNote = this.guitarNotes[randomNote.string] as Note;
    let steps = randomNote.fret;

    while (steps > 0) {
      const idx = this.notes.findIndex((n) => n.int === currentNote.int);
      const nextIdx = idx === this.notes.length - 1 ? 0 : idx + 1;

      if (steps >= 2) {
        steps = currentNote.toneNext === Tone.Full ? steps - 2 : steps - 1;
        currentNote = this.notes[nextIdx];
        continue;
      }
      
      return currentNote.toneNext === Tone.Full
        ? { ...currentNote, halfTone: "#" }
        : this.notes[nextIdx];
    }

    return currentNote;
  }

  private randString(max?: number): number {
    return this.rand(max || this.config.strings);
  }

  private randFrets(max?: number): number {
    return this.rand(max || this.config.frets);
  }

  private rand(max: number, min = 1): number {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }
}

const program = new GuitarNotes({
  element: document.querySelector('#app'),
}).initialize();
const maxFret = document.querySelector('.maxFret') as HTMLInputElement;
const buttonGenerate = document.querySelector('.generateNote') as HTMLElement;
const buttonShow = document.querySelector('.showNote') as HTMLElement;
const noteDisplay = document.querySelector('.noteDisplay') as HTMLElement;
const noteResult = document.querySelector('.noteResult') as HTMLElement;
const noteResultContainer = document.querySelector('.noteResultContainer') as HTMLElement;

let randomNote: INotePosition = null;

const generate = () => {
  randomNote = program.generateRandNote(+maxFret.value);

  if (randomNote.string < 1 || randomNote.string > 6) return generate();

  showResultContainer();
  toggleNoteResult(false);

  noteDisplay.innerHTML = `Струна: ${randomNote.string} | ${program.getNoteName(
    randomNote.string as GuitarString
  )} <br> Лад: ${randomNote.fret}`;
};
const showResultContainer = () => {
  noteResultContainer.style.display = "block";
};
const toggleNoteResult = (shouldShow: boolean = false) => {
  noteResult.style.display = shouldShow ? "block" : "none";
};
const showNote = () => {
  const note = program.findFinalNote(randomNote);
  const halfTone = note.halfTone ?? "";
  noteResult.innerHTML = `Нота: ${note.int}${halfTone} (${note.rus}${halfTone})`;
  toggleNoteResult(true);
}

buttonGenerate.addEventListener('click', generate);
buttonShow.addEventListener('click', showNote);
