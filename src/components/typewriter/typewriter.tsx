import { Component, Prop, h} from '@stencil/core';
import { interval, map, take, concat, of, delay, ignoreElements, from, concatMap, repeat } from 'rxjs';

@Component({
  tag: 't-writer',
  styleUrl: 'typewriter.scss',
  shadow: true
})

export class VoiceInput {
@Prop() lines: (string[] | string);
el: HTMLElement;

type = ( word: any, speed: any, backwards = false ) =>
interval(speed).pipe(
  map(x =>
    backwards ? word.substr(0, word.length - x - 1) : word.substr(0, x + 1)
  ),
  take(word.length)
);

typeEffect = (word: any) =>
concat(
  this.type(word, 50), // type forwards
  of("").pipe(
    delay(1200),
    ignoreElements()
  ), // pause
  this.type(word, 30, true), // delete
  of("").pipe(
    delay(300),
    ignoreElements()
  ) // pause
);

componentDidLoad(){
  if(typeof this.lines === 'string'){
    this.lines = JSON.parse(this.lines);
  }
  from(this.lines).pipe(
    concatMap(this.typeEffect),
    repeat()
  ).subscribe((x:any) => {
    this.el.innerHTML = x;
  });
}

  render() {
    return (
      <div ref={(el:HTMLElement)=>this.el = el}></div>
    );
  }
}
