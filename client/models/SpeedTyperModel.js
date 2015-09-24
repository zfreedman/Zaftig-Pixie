var SpeedTyperModel = Backbone.Model.extend({
  defaults: {
    paragraph: "hello world I am fast typer",
    // splitParagraph: this.get('paragraph').split(" "),
    numMissed: 0,
    numCorrect: 0,
    currentIndex: 0

  },

  initialize: function () {
    // TODO: GET request to server for paragraph text

    this.set('paragraphArray', this.get('paragraph').split(' '));
  
  },

  spaceHandler: function (inputWord) {
    this.set( 'inputWord', inputWord );
    if( inputWord === this.get('paragraphArray')[this.currentIndex] ){
      this.set( 'numCorrect', this.get('numCorrect') + 1 );
    } else {
      this.set( 'numMissed', this.get('numMissed') + 1 );
    }

    this.set( 'currentIndex', this.get('currentIndex') + 1 );
    this.trigger('updateWord', this);
    //this.trigger('updateWord') -- the view needs to render the word at the next index 
  }


  // startGame: function() {
  //   set startTimer: ___,
  //   finishTimer: ___
  // }


})