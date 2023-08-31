import { Component, h, Element, Prop, State } from '@stencil/core';

@Component({
  tag: 'f-reader',
  styleUrls: ['focused-reader.scss'],
  shadow: true
})
export class FocusedReader {
  @Element() el: HTMLElement;
  @Prop() focused = false;
  @Prop() speakable = false;
  @Prop() controls = ['rate', 'pitch', 'pause', 'stop', 'restart']
  synth = window.speechSynthesis;
  @State() utter: SpeechSynthesisUtterance;
  @State() paused = false;
  @State() rate = 1;
  @State() pitch = 1;
  rateInput: HTMLInputElement;
  pitchInput: HTMLInputElement;
  timer: number;
  tr = {
    queue: null,
    pause: () => this.synth.pause(),
    play: () => this.synth.resume(),
    cancel: () => this.synth.cancel(),
  };

  returnHTML() {
    const content = this.el.innerHTML;
    if (this.focused) {
      return `<span class=${this.speakable ? 'read' : ''}>${content
        .split(/\s+/)
        .map(word => {
          const mid = Math.ceil(word.length / 2);
          return `<b>${word.slice(0, mid)}</b>${word.slice(mid)}`;
        })
        .join(' ')}</span>`;
    }
    return `<span class=${this.speakable ? 'read' : ''}>${content}</span>`;
  }

  updateRate = ev => {
    this.rate = parseFloat(ev.target.value); // update rate value
    this.restartUtterance(); // restart utterance with updated values
  };

  updatePitch = ev => {
    this.pitch = parseFloat(ev.target.value); // update pitch value
    this.restartUtterance(); // restart utterance with updated values
  };

  restartUtterance() {
    if (this.utter) {
      this.synth.cancel(); // stop the current utterance
      this.paused = false; // set paused to false
      this.tr.queue(this.el.innerHTML); // re-queue the utterance with updated values
    }
  }

  createTextReader() {
    this.tr.queue = text => {
      this.utter = new SpeechSynthesisUtterance(text);
      this.utter.rate = this.rate;
      this.utter.pitch = this.pitch;
      ['pause', 'resume'].forEach(event => this.utter.addEventListener(event, () => (this.paused = event === 'pause')));
      this.utter.addEventListener('end', () => {
        this.paused = false;
        this.utter = null;
      });
      this.synth.speak(this.utter);
    };
  }

  connectedCallback() {
    this.createTextReader();
  }

  disconnectedCallback() {
    this.stopSynth();
  }

  stopSynth() {
    this.tr.cancel();
    this.utter = null;
    this.paused = false;
  }

  render() {
    return (
      <div>
        <div class="read-block" innerHTML={this.returnHTML()} onClick={() => this.utter ? this.synth.resume() : this.tr.queue(this.el.innerHTML)}></div>
        <div class="bar">
          <div class="info left-align">
            <b>Words/Chars:</b> {this.el.innerHTML.match(/[\w\d\’\'-]+/gi).length} / {this.el.innerHTML.length}
          </div>
          <div class="btn-group right-align">
            <div style={{ visibility: this.utter ? 'visible' : 'hidden' }}>
              <div id="rate" style={{ display: this.controls.includes('rate') ? 'inline' : 'none' }}>
              <b>Rate</b>
              <input value={this.rate} onInput={this.updateRate} type="range" min="0.5" max="2" step="0.25" id="rate" />
              </div>
              <div id="pitch" style={{ display: this.controls.includes('pitch') ? 'inline' : 'none' }}>
              <b>Pitch</b>
              <input value={this.pitch} onInput={this.updatePitch} type="range" min="0.5" max="2" step="0.25" id="pitch" />
              </div>
              <button class="btn" style={{ display: this.controls.includes('pause') && this.paused && this.utter ? 'inline' : 'none' }} onClick={this.tr.play}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                  <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                </svg>
              </button>
              <button class="btn" style={{ display: this.controls.includes('pause') && !this.paused && this.utter ? 'inline' : 'none' }} onClick={this.tr.pause}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512">
                  <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />
                </svg>
              </button>
              <button class="btn" style={{ display: this.controls.includes('stop') ? 'inline' : 'none' }} onClick={() => this.stopSynth()}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                  <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" />
                </svg>
              </button>
              <button class="btn" style={{ display: this.controls.includes('restart') ? 'inline' : 'none' }} onClick={() => this.restartUtterance()}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                  <path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        </div>
    );
  }
}
