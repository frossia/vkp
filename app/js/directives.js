vkp.directive( "load", [ function() {
	return {

		restrict: 'E',
    scope: {
      curVal: '@',
      nextVal: '@'
    },		
		templateUrl: 'partials/loading.html',
		// replace: true,

		link: function($scope, element, attr) {

			var s = Snap("#loading");
			var path = "M0 0 C 20 80, 40 80, 50 60";
			// var bigCircle = s.path(path);
			var c = s.circle(40,40,35);

			function updateProgress() {
				// var preVal
				Snap.animate($scope.curVal,$scope.nextVal, function (val) {
					c.attr({ 'strokeDashoffset': val });
					// console.log($scope.curVal, $scope.nextVal)					
					// $scope.curVal = $scope.nextVal;
				}, 400, mina.easeinout);
			}

			c.attr({
			    fill: "transparent",
			    stroke: "#fff",
			    strokeWidth: 10,
			    transform: 'rotate(-90 40 40)',
				  strokeDasharray: 225,
				  strokeDashoffset: 100
			});		

			$scope.$watch('nextVal', updateProgress);

			// var t = s.text(40,50,'99');

			// t.attr({
			// 	fill: '#fff',
			// 	fontSize: 30,
			// 	textAnchor: "middle"
			// });


		}

	};

}]);

vkp.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                element.addClass('loaded');
            });
        }
    };
});

vkp.directive('noImage', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

        	
          attrs.$observe('noImage', function(value){
          	if (value == 'true') {
          		id = attrs.hash.replace(':','');
	            // console.log(element);
	      			element.addClass('no-image');
	      			var canvas = angular.element('<svg id='+ id +' class="svg-no-image"></svg>');
	      			canvas.addClass('anim');
	      			element.prepend(canvas)

	      			var draw = Snap('#' + id);
	      			// rects = [];

	      			for (i = 0; i < 10; i++) { 
	      				for (j = 0; j < 10; j++) { 
							  	draw.rect(i*30,j*30,30,30).attr({
							  		fill: getRandomColor()
							  		// opacity: 0.1
							  	});
							  	// console.log('ss')
								};
							};

							function getRandomColor() {
							    var letters = '0123456789ABCDEF'.split('');
							    var color = '#';
							    for (var i = 0; i < 6; i++ ) {
							        color += letters[Math.floor(Math.random() * 16)];
							    }
							    return color;
							}							

	      			// c = draw.circle(150,150,100);

	      			// console.log(draw);


          	}
          });
        	// if 
        	// console.log(attrs);
        		// if scope.son
            // element.bind('load', function() {
            // });
        }
    };
});


