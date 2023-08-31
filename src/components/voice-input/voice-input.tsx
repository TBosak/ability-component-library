import { Component, Prop, h} from '@stencil/core';

@Component({
  tag: 'v-input',
  styleUrl: 'voice-input.scss',
  shadow: true
})

export class VoiceInput {
  @Prop() type: string;
  @Prop() placeholder: string;
  input: HTMLInputElement;
  icon: SVGElement;

  componentDidLoad(){
    this.input.addEventListener('focus', () => {
      this.triggerRecording();
    })
  }

  triggerRecording(){
    const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.start();
        recognition.addEventListener('result', (e) => {
          const last = e.results.length - 1;
          const text = e.results[last][0].transcript;
          let speechResult = text.replace(/[\.,!?;]$/, '');
          this.input.value = speechResult;
        });
      });
  }

  render() {
    return (
        <input ref={(el:HTMLInputElement)=>this.input = el} type={this.type ?? 'text'} placeholder={this.placeholder}/>
    );
  }
}
