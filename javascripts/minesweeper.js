/**
 * Minesweeper
 * @param String instanceName
 * @param String elementID
 * @param String difficulty
 */
Minesweeper = function(instanceName, elementId, difficulty) {
	this.instanceName = instanceName;
	this.elementId = elementId;
	this.smileyImgSrc = 'images/smiley.gif';
	this.lostImgSrc = 'images/lost.gif';
	this.wonImgSrc = 'images/won.gif';
	this.clickedImgSrc = 'images/clicked.gif';
	this.lost = false;
	this.rowClicked;
	this.colClicked;
	switch(difficulty) {
		case 'intermediate':
			this.difficulty = 'intermediate';
			this.rows = this.cols = 16;
			this.flags = 40;
			break;
		case 'expert':
			this.difficulty = 'expert';
			this.rows = 16;
			this.cols = 30;
			this.flags = 99;
			break;
		default:
			this.difficulty = 'beginner';
			this.rows = this.cols = 9
			this.flags = 10;
	};
	this.mines = 0;
	this.coveredCells = this.rows*this.cols; //game won when covered cells equals the number of mines
	this.board = []; //represent game board with 2D array
	for(var row=0; row<this.rows; row++) {
		this.board[row] = [];
		for(var col=0; col<this.cols; col++) {
			this.board[row][col] = new MineSweeperCell();
		};
	};
	//add mine in random cell until number of cells added for difficulty level
	while(this.mines < this.flags) {
		var row = Math.round(Math.random()*(this.rows - 1));
		var col = Math.round(Math.random()*(this.cols - 1));
		if (!this.board[row][col].armed) {
			this.board[row][col].armed = true;
			this.mines++;
		};
	};
	
	//preload images
	new Image().src = this.smileyImgSrc;
	new Image().src = this.lostImgSrc;
	new Image().src = this.wonImgSrc;
	new Image().src = this.clickedImgSrc;

	/**
	 * Replaces HTML of element with result of toHTML()
	 * @return void
	 */
	this.replace = function() {
		document.getElementById(this.elementId).innerHTML = this.toHTML();
	};

	/**
	 * Returns an HTML table element-representation of the MineSweeper object
	 * @return String
	 */
	this.toHTML = function() {
		var html = "<table>\n";
		html += "<thead>\n";
		html += "<th colspan=\"" + this.cols + "\">";
		html +=	'<div id="flags">' + this.flags + "</div>\n";
		html += "<div id=\"smiley\">\n";
		
		if (this.lost) {
			var imgSrc = this.lostImgSrc;
		} else if (this.isWon()) {
			var imgSrc = this.wonImgSrc;
		} else {
			var imgSrc = this.smileyImgSrc;
		};
		html += '<img src="' + imgSrc + '" id="smiley_img" ';
		html += 'alt="Click to start a new game" title="Click to start a new game" ';
		html += 'onmousedown="this.setAttribute(\'src\',\'images/new.gif\');" ';
		html += 'onclick="' + this.instanceName + ' = new Minesweeper(\'' 
		html += this.instanceName + '\', \'' + this.elementId + '\', \''
		html += this.difficulty + '\');' + this.instanceName + ".replace();\">\n";
		
		html += "</div>\n";
		html += "</th>\n";
		html += "</tr>\n";
		html += "</thead>\n";
		
		html += '<tbody';
		if (!this.lost && !this.isWon()) {
			html += " onmouseout=\"document.getElementById('smiley_img').setAttribute('src','images/smiley.gif');\"";
		}
		html += ">\n";
		
		for (var row=0; row<this.rows; row++) {
			html += "<tr>\n";
			for (var col=0; col<this.cols; col++) {
				var cell = this.board[row][col];
				var attr = '';
				var cell_value ='';
				if (cell.covered) {
					if (this.lost && cell.armed) {
						attr += this.rowClicked == row && this.colClicked == col ? ' class="armed_and_clicked"' : ' class="armed"';
					} else if (this.lost && cell.flagged && !cell.armed) {
						attr += ' class="flagged_wrong"';
					} else if (cell.flagged) {
						attr += ' class="flagged" ';
						if (!this.lost && !this.won) {
							attr += 'onmousedown="if (event.button == 2) {' + this.instanceName + '.flag(' + row + ',' + col + ');' + this.instanceName + '.replace();};" ';
							attr += 'oncontextmenu="return false;" ';
						};
					} else if (cell.questioned) {
						attr += ' class="questioned" ';
						if (!this.lost && !this.won) {
							attr += 'onmousedown="if (event.button == 2) {' + this.instanceName + '.flag(' + row + ',' + col + ');' + this.instanceName + '.replace();};" ';
							attr += 'oncontextmenu="return false;" ';
						};
					} else if (!this.lost && !this.isWon()) {
						attr += ' class="covered" ';
						attr += 'onclick="' + this.instanceName + '.click(' + row + ',' + col + ');' + this.instanceName + '.replace();" ';
						attr += 'onmousedown="if (event.button == 2) {' + this.instanceName + '.flag(' + row + ',' + col + ');' + this.instanceName + '.replace();} ';
						attr += "document.getElementById('smiley_img').setAttribute('src','images/clicked.gif');\" "
						attr += 'oncontextmenu="return false;" ';
					} else {
						attr += ' class="covered"';
					};
				} else {
					if (cell.mines > 0) {
						attr += ' class="number"';
						cell_value += '<span class="value' + cell.mines + '">' + cell.mines + '</span>';
					};
				};
				html += '<td' + attr + '>' + cell_value + "</td>\n";
			};
			html += "<tr>\n";
		};
		
		html += "</tbody>";
		return (html += '</table>');
	};

	/**
	 * Prints a navigation menu to toggle between game difficulties
	 */
	this.printNav = function() {
		var beginner = '<span class="minesweeper_nav" onclick="' + this.instanceName + ' = new Minesweeper(\'' + this.instanceName + '\',\'' + this.elementId + '\',\'beginner\');' + this.instanceName + '.replace();">Beginner</span>';
		var intermediate = '<span class="minesweeper_nav" onclick="' + this.instanceName + ' = new Minesweeper(\'' + this.instanceName + '\',\'' + this.elementId + '\',\'intermediate\');' + this.instanceName + '.replace();">Intermediate</span>';
		var expert = '<span class="minesweeper_nav" onclick="' + this.instanceName + ' = new Minesweeper(\'' + this.instanceName + '\',\'' + this.elementId + '\',\'expert\');' + this.instanceName + '.replace();">Expert</span>';

		return beginner + ' | ' + intermediate + ' | ' + expert;
	};

	/**
	 * reveal contents of cell (row,col)
	 * @param int row
	 * @param int col
	 * @return void
	 */
	this.click = function(row, col) {
		if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
			this.rowClicked = row;
			this.colClicked = col;
			
			if (this.board[row][col].armed) {
				this.lost = true;
			} else {
				this.coveredCells--;
				if (this.board[row][col].flagged) {
					this.flags--;
				};
				this.board[row][col].covered = false;
				this.board[row][col].flagged = false;
				this.board[row][col].questioned = false;
				var rowStart = row > 0 ? row - 1 : 0;
			    var rowEnd = row < this.rows - 1 ? row + 1 : this.rows - 1;
			    var colStart = col > 0 ? col - 1 : 0;
			    var colEnd = col < this.cols - 1 ? col + 1 : this.cols - 1;
				
				//Count number of armed adjacent cells
				for (var r=rowStart; r<=rowEnd; r++) {
					for (var c=colStart; c<=colEnd; c++) {
						if (this.board[r][c].armed) {
							this.board[row][col].mines++;
						};
					};
				};
				
				//If no adjacent cells are armed, click all uncovered adjacent cells
				if (this.board[row][col].mines == 0) {
					for (var r=rowStart; r<=rowEnd; r++) {
						for (var c=colStart; c<=colEnd; c++) {
							if (this.board[r][c].covered) {
								this.click(r,c);
							};
						};
					};
				};
			};
		};
	};

	/**
	 * Markes a cell as flagged or questioned, or removes all markers from the cell
	 * @param int row
	 * @param int col
	 * @return void
	 */
	this.flag = function(row, col) {
		if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
			
			if (this.board[row][col].flagged) {
				this.board[row][col].flagged = false;
				this.board[row][col].questioned = true;
				this.flags++;
			} else if (this.board[row][col].questioned) {
				this.board[row][col].questioned = false;
			} else {
				if (this.flags > 0) {
					this.board[row][col].flagged = true;
					this.flags--;
				};
			};
		};
	};

	/**
	 * Return a boolean depending on whether or not game is won
	 * @return boolean
	 */
	this.isWon = function() {
		return this.coveredCells == this.mines;
	};
};

/**
 * Class to represent a cell in Minesweeper game board
 */
MineSweeperCell = function() {
	//declare instance variables
	this.covered = true;
	this.armed = false;
	this.flagged = false;
	this.questioned = false;
	this.mines = 0;
};