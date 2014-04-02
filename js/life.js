(function () {
  var canvas = document.getElementById('grid');
  var cellSize = 5;
  var w = Math.floor(window.innerWidth / cellSize) * cellSize;
  var h = Math.floor(window.innerHeight / cellSize) * cellSize;

  canvas.width = w;
  canvas.height = h;

  var GameOfLife = (function(rows, cols) {
    var grid = new Array(rows);
    var next = new Array(rows);
    var hasChanged = new Array(rows);
    for (var i = 0; i < grid.length; i++) {
      grid[i] = new Array(cols);
      next[i] = new Array(cols);
      hasChanged[i] = new Array(cols);
    }

    /**
     * Initializes the grid with random seed
     */
    var randomSeed = function(p) {
      p = p || 0.5;
      for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
          grid[i][j] = Math.random() < p;
          hasChanged[i][j] = grid[i][j];
        }
      }
    };

    /**
     * Draws the canvas
     */
    var draw = function(canvas) {
      var ctx = canvas.getContext('2d');
      // Clear the whole canvas to redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
          if (grid[i][j]) {
            // Use a different color if the cell has just changed
            ctx.fillStyle = hasChanged[i][j] ? 'rgb(253,151,31)' : 'rgb(166,226,46)';
            ctx.fillRect(j*cellSize, i*cellSize, cellSize, cellSize);
          }
        }
      }
    };

    /**
     * Count the alive neighbors of a cell
     */
    var countNeighboors = function(i, j) {
      var count = 0;
      for (var r = i-1; r <= i+1; r++) {
        for (var c = j-1; c <= j+1; c++) {

          //toroidal array
          var row = (r >= 0 ? r : grid.length + r) ;
          row = row % grid.length;

          var col = (c >= 0 ? c : grid[row].length + c);
          col = col % grid[row].length;

          if (col == j && row == i) continue;
          count += grid[row][col] ? 1 : 0;
        }
      }
      return count;
    };

    /**
     * Apply rules of life and death to
     * the next generation of cells:
     *
     * - Any live cell with fewer than two live neighbours dies, as if caused by under-population.
     * - Any live cell with two or three live neighbours lives on to the next generation.
     * - Any live cell with more than three live neighbours dies, as if by overcrowding.
     * - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
     */
    var nextGeneration = (function() {
      var steps = 0;
      return function(callback) {
        var cells = 0;
        steps++;
        for (var i = 0; i < grid.length; i++) {
          for (var j = 0; j < grid[i].length; j++) {
            var c = countNeighboors(i, j);
            next[i][j] = (c == 3 || (grid[i][j] && c == 2)) ;
            if (next[i][j]) cells++;
            hasChanged[i][j] = next[i][j] != grid[i][j];
          }
        }
        copy(next, grid);
        if (callback) callback();
      };
    })();

    /**
     * Util function to copy bidimensional arrays
     */
    var copy = function(src, dst) {
      for (var i = 0; i < src.length; i++) {
        for (var j = 0; j < src[i].length; j++) {
          dst[i][j] = src[i][j];
        }
      }
    };

    var init = function(canvas) {
      randomSeed();
      var redraw = function () {
        draw(canvas);
      };

      (function f() {
        nextGeneration(redraw);
        window.requestAnimationFrame(f);
      })();
    };

    return {
      init: init
    };
  })(h/cellSize, w/cellSize);

  GameOfLife.init(canvas);
})();

