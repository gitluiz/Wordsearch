var Main = function(game){

};

Main.prototype = {


	newDictionary : [],

  // we are going to make a list of reserved tiles and also map the letter to it.
  // this way if we have an intersecting word, we can allow the word to use the tile.
	reserved : [],

	chosenWord : '',

	rows: [],

	columns: [],

	selectedTiles: [],

	lockedTiles: [],

	hoverTile: {},

	create: function() {

		 	var me = this;
			var s = game.add.sprite(0, 0, 'background');
		 	// setup for interaction
			me.guessing = false;
			me.currentWord = [];
			me.correctWords = [];

			// Key up and down
			me.game.input.onDown.add(function(){me.guessing = true;}, me);
			me.game.input.onUp.add(function(){me.guessing = false;}, me);
			

			// the words
	   	var dictionary = this.game.cache.getText('dictionary');

	   	// create array with teh words
	  	dictionary = dictionary.split('\n');

	  	this.createNewDictionary(dictionary);
	 	
	    for(x=0;x<25;x++){
	    	me.columns.push(''+x+'')
	    }

	    for(x=0;x<25;x++){
	    	me.rows.push(''+x+'')
	    }

	    // Pick random 15 rows
	    me.rows = me.getRandomMultiple( me.rows, 15);

	    // Pick random 15 columns
	    me.columns = me.getRandomMultiple( me.columns, 15);


	    //Set the background colour of the game
	    me.game.stage.backgroundColor = "34495f";
	 
	    //Declare assets that will be used as tiles
	    me.tileLetters = [
	        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
	        'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
	        'w', 'x', 'y', 'z'
	    ];
	 
	    //What colours will be used for our tiles?
	    me.tileColors = [
	        '#ffffff'
	    ];
	 
	    //Set the width and height for the tiles
	    me.tileWidth = 40;
	    me.tileHeight = 40;
			me.selectBuffer = me.tileWidth / 8;
	 
	    //This will hold all of the tile sprites
	    me.tiles = me.game.add.group();
	 
	    //Initialise tile grid, this array will hold the positions of the tiles
	    //Create whatever shape you'd like
	    me.tileGrid = [
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	    ];
	 
	    //Keep a reference to the total grid width and height
	    me.boardWidth = me.tileGrid[0].length * me.tileWidth;
	    me.boardHeight = me.tileGrid.length  * me.tileHeight;
	 
	    //We want to keep a buffer on the left and top so that the grid
	    //can be centered
	    me.leftBuffer = (me.game.width - me.boardWidth) / 2;
	    me.topBuffer = (me.game.height - me.boardHeight) / 2;
	 
	    //Create a random data generator to use later
	    var seed = Date.now();
	    me.random = new Phaser.RandomDataGenerator([seed]);
	 
	    //Set up some initial tiles and the score label
	    me.initTiles();
	},

	gameOver: function(){

		this.game.state.start('GameOver');
	},

	createNewDictionary: function(dictionary){

	   
   	// horizontal or vertical
   	var orientation = new Array('h','v');

		// loop thru dictionary
  	for(d=0;d<dictionary.length;d++){

  		// determine each word orientation (horizontal/vertical)
  		var orient = orientation[Math.floor(Math.random() * orientation.length)];

  		this.newDictionary.push({
  			orientation : orient,
  			length : dictionary[d].length,
  			word: dictionary[d]
  		});
  	}
	},

	getRandomMultiple: function(arr, n){
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
	},

	deleteWordFromDictionary: function(word){
		for(x=0;x<this.newDictionary.length;x++){
			if( this.newDictionary[x].word == word ){
				this.newDictionary.splice(x, 1);
			}
		}
	},

	isReservedSpot : function(coord){

		var result = false;;

		for(x=0;x<this.reserved.length;x++){
			if(this.reserved[x].coord == coord){
				result = true;
				break;
			}
		}

		return result;
	},

	mapLetters: function(wordObject, x, y, index){
		if(wordObject.orientation == 'h'){
			return (x+index)+','+y;
		} else {
			return x+','+(y+index);
		}
	},

	unfit: function(wordObject, x, y){

		// check if any of the letters have reserved spots
		var unfit = false;

		var wordArray = wordObject.word.split('');

		if( wordObject.orientation == 'h' ){

			if( (wordObject.length + x) > this.tileGrid[0].length ){
				unfit = true;
			}

		} else {

			if( (wordObject.length + y) > this.tileGrid[0].length ){
				unfit = true;
			}

		}

		if(unfit) return unfit;

		for( index=0; index<wordArray.length; index++ ){

			var coord = this.mapLetters(wordObject, x, y, index);

			// if a letter in the word finds a reserved spot
			// it is not fit for that spot.
			if( this.isReservedSpot(coord) ){
				unfit = true;
				break;
			}
		}

		return unfit;
	},

	reserveWordTiles: function(wordObject, x, y){

		var wordArray = wordObject.word.trim().split('');

		for( index=0; index<wordArray.length; index++ ){

			if( wordArray[index] != '' ){

				var coord = this.mapLetters(wordObject, x, y, index);

				this.reserved.push({
					coord: coord,
					letter: wordArray[index]
				});

	  		this.deleteWordFromDictionary(wordObject.word);

	  		//delete the row from reserved so no overlap

			}

  	}
	},

	findLetter: function(coord){

		var match = '';
		for(n=0;n<this.reserved.length;n++){

			if(this.reserved[n].coord == coord){
				match = this.reserved[n].letter;
				break;
			}
		}

		return match;
	},

	verifyWord: function(word){

		var result = '';
    var dictionary = this.game.cache.getText('dictionary').split("\n");

    for(x=0;x<dictionary.length;x++){

    	if(dictionary[x].trim() == word){
    		result = word;
    		break;
    	}
    }
    return result;
	},

	initTiles: function(){

    // X =Loop through each column in the grid
    for(var y = 0; y < this.tileGrid.length; y++){
 
      // Y = Loop through each row
      for(var x = 0; x < this.tileGrid.length; x++){						

				var coordinates = x+','+y;

				// check if we still have words in the dictionary and if the chosenword has length
				if( this.newDictionary.length > 0 ){

					// pick a random word from the newDictionary array
  				var randomWord = this.newDictionary[Math.floor(Math.random() * this.newDictionary.length)];
  				this.chosenWord = randomWord.word;

  				// HORIZONTAL PLACEMENT
  				if( randomWord.orientation == 'h' ){

			  		if( this.rows.indexOf(''+y+'') >= 0)
			  		// if unfit, move on to the next tile
			  		if(!this.unfit(randomWord, x, y)){

			  			this.reserveWordTiles(randomWord, x, y);
			  		}

			  	}

  				// VERTICAL PLACEMENT
			  	if( randomWord.orientation == 'v' ){

			  		if( this.rows.indexOf(''+x+'') >= 0)
			  		// if unfit, move on to the next tile
			  		if(!this.unfit(randomWord, x, y)){

			  			this.reserveWordTiles(randomWord, x, y);
			  		}

			  	}
			  	
    		}

    		// what letter is this tile coordinates
    		var letter = this.findLetter(coordinates);

        // Add the tile to the game at this grid position
       	var tile = this.addTile(x, y, letter);

        // Keep a track of the tiles position in our tileGrid
       	this.tileGrid[y][x] = tile;

      }
    }
	},

	update: function() {
	 
	    var me = this;

	    if(me.guessing){
	 				
	 				
	        //Get the location of where the pointer is currently
	        var hoverX = me.game.input.x;
	        var hoverY = me.game.input.y;
	 
	        //Figure out what position on the grid that translates to
	        var hoverPosX = Math.floor((hoverX - me.leftBuffer)/me.tileWidth);
	        var hoverPosY = Math.floor((hoverY - me.topBuffer)/me.tileHeight);
	 
	        //Check that we are within the game bounds
	        if(hoverPosX >= 0 && hoverPosX < me.tileGrid[0].length && hoverPosY >= 0 && hoverPosY < me.tileGrid.length){
	 
	            //Grab the tile being hovered over
	            this.hoverTile = me.tileGrid[hoverPosY][hoverPosX];
	 
	            //Figure out the bounds of the tile
	            var tileLeftPosition = me.leftBuffer + (hoverPosX * me.tileWidth);
	            var tileRightPosition = me.leftBuffer + (hoverPosX * me.tileWidth) + me.tileWidth;
	            var tileTopPosition = me.topBuffer + (hoverPosY * me.tileHeight);
	            var tileBottomPosition = me.topBuffer + (hoverPosY * me.tileHeight) + me.tileHeight;


	 
	            //If the player is hovering over the tile set it to be active. The buffer is provided here so that the tile is only selected
	            //if the player is hovering near the center of the tile
	            if(

	            	!this.hoverTile.isActive 
	            	&& hoverX > tileLeftPosition + me.selectBuffer 
	            	&& hoverX < tileRightPosition - me.selectBuffer
	              && hoverY > tileTopPosition + me.selectBuffer 
	              && hoverY < tileBottomPosition - me.selectBuffer

	            ){
	 
                //Set the tile to be active
            		this.hoverTile.tint = 0xffd493;
                this.hoverTile.isActive = true;

                 	 
                //Push this tile into the current word that is being built
                me.currentWord.push(this.hoverTile.tileLetter);

	            }
	 
	        }
	 
	    }
	    else {
 					 
	        if(me.currentWord.length > 0){
	 
            var guessedWord = '';

            guessedWord = me.currentWord.join('');
            
            var verified = me.verifyWord(guessedWord);

            //Check to see if this word exists in our dictionary
            if(verified.length > 0 && guessedWord.length > 1){

              //Check to see that the word has not already been guessed
              if(me.correctWords.indexOf(guessedWord) == -1){

                this.lockTiles();

                //Add this word to the already guessed word
                me.correctWords.push(guessedWord);

						   	var dictionary = this.game.cache.getText('dictionary').split('\n');

                if( me.correctWords.length == dictionary.length ){
                	document.getElementById('modal').classList.add('active');
                }
                
                var listItem = document.getElementById(guessedWord);
                listItem.classList.add("found");
              }

            }
            else {


		        	this.hoverTile.tint = 0xffffff;
		    			this.hoverTile.isActive = false;

            	console.log('not correct');

              this.resetTiles();
            	
            }
 
            //Reset the current word
						me.currentWord = [];
	 
	        }
	 
	    }
	},

	resetTiles: function(){

		for( x=0; x<this.tileGrid.length; x++ ){

			for( y=0; y<this.tileGrid[x].length; y++ ){

				if(this.tileGrid[x][y].isActive && !this.tileGrid[x][y].locked){

					this.tileGrid[x][y].tint = 0xffffff;
					this.tileGrid[x][y].isActive = false;
				}

			}

		}
	},

	lockTiles: function(){

		for( x=0; x<this.tileGrid.length; x++ ){

			for( y=0; y<this.tileGrid[x].length; y++ ){

				if(this.tileGrid[x][y].isActive){

					this.tileGrid[x][y].locked = true;
				}

			}

		}

	},

	addTile: function(x, y, letter){
	 
	    var me = this;

	    //Choose a random tile to add
	    var tileLetter = !letter ? me.tileLetters[me.random.integerInRange(0, me.tileLetters.length - 1)] : letter;//;
	    var tileColor = me.tileColors[me.random.integerInRange(0, me.tileColors.length - 1)];
	    var tileToAdd = me.createTile(tileLetter, tileColor);  
	 
	    //Add the tile at the correct x position, but add it to the top of the game (so we can slide it in)
	    var tile = me.tiles.create(me.leftBuffer + (x * me.tileWidth) + me.tileWidth / 2, 0, tileToAdd);
	 
	    //Animate the tile into the correct vertical position
	    me.game.add.tween(tile).to({y:me.topBuffer + (y*me.tileHeight+(me.tileHeight/2))}, 500, Phaser.Easing.Linear.In, true)
	 
	    //Set the tiles anchor point to the center
	    tile.anchor.setTo(0.5, 0.5);
	 
	    //Keep track of the type of tile that was added
	    tile.tileLetter = tileLetter;
	 
	 		tile.isActive = false;
	 		tile.locked = false;

	    return tile;
	},

	createTile: function(letter, color){
 
    var me = this;
 
    var tile = me.game.add.bitmapData(me.tileWidth, me.tileHeight);
 
    tile.ctx.rect(1, 1, me.tileWidth - 1, me.tileHeight - 1);
    tile.ctx.fillStyle = color;
    tile.ctx.fill();
 
    tile.ctx.font = '15px Arial';
    tile.ctx.textAlign = 'center';
    tile.ctx.textBaseline = 'middle';
    tile.ctx.fillStyle = '#fff';
    if(color == '#ffffff'){
        tile.ctx.fillStyle = '#000000';
    }
    tile.ctx.fillText(letter, me.tileWidth / 2, me.tileHeight / 2);
 
    return tile;
	}

};