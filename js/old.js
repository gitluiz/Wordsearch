
	  				// VERTICAL PLACEMENT

						// check if the word is horizontal and if the row is reserved
				  	// if( randomWord.orientation == 'h' && me.columns.indexOf(''+y+'') != -1){

				  	// 	// check if any of the letters have reserved spots
				  	// 	var unfit = false;

				  	// 	for( h=0; h<randomWord.word.split('').length; h++ ){

				  	// 		var place = (x+h)+','+y;

				  	// 		// if a letter in the word finds a reserved spot
				  	// 		// it is not fit for that spot.
				  	// 		if( me.isReservedSpot(place) ){
				  	// 			unfit = true;
				  	// 			break;
				  	// 		}
				  	// 	}

				  	// 	// not unfit, push it into the reservation
				  	// 	// and delete from the dictionary
				  	// 	if( !unfit ){

				  	// 		me.reserved.push({
				  	// 			coord: place,
				  	// 			letter: letter
				  	// 		});

					  // 		me.deleteWordFromDictionary(me.chosenWord);

					  // 		//delete the row from reserved so no overlap
				  	// 		me.columns.splice(me.columns.indexOf(''+y+''), 1);

				  	// 	// move on to the next tile
				  	// 	} else {
				  	// 		continue;
				  	// 	}

				  	// }


						/*// check if the word is horizontal and if the row is reserved
				  	if( randomWord.orientation == 'h' && columns.indexOf(''+y+'') != -1){

				  		randomWord.word.split('').forEach(function(letter, index, word){

				  			var place = (x+index)+','+y;

				  			if( !me.isReservedSpot(place) ){

					  			me.reserved.push({
					  				coord: place,
					  				letter: letter
					  			});
				  			}

				  		});

				  		me.deleteWordFromDictionary(me.chosenWord);

				  		//delete the column from reserved so no overlap
				  		columns.splice(columns.indexOf(''+y+''), 1);
				  	}*/



				  	// if the tile coordinate matches the map, place the letter