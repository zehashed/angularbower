var header = angular.module('Header', ['ngMaterial', 'ngMdIcons']);
header.controller('HeaderController', ['$scope', function($scope) {
}])
.directive('mangaHeader', function() {
  return {
    templateUrl: 'app/directives/header.html'
  };
});


var app =  angular.module('MangaApp',['ngMaterial', 'ngMessages','angularUtils.directives.dirPagination','ngRoute' ,'ngMdIcons']);
	app.config(function($routeProvider) {
    $routeProvider.
    when('/list', {
    	redirectTo: '/home'
//         controller: "listCtrl",
//         templateUrl: 'app/directives/list/list.html'
    }).
    when('/detail/:id', {
        controller: "DetailCtrl",
        templateUrl: 'app/directives/detail/detail.html'
    }).
    when('/chapter/:mangaId/:chapterId', {
        controller: "ChapterCtrl",
        templateUrl: 'app/directives/chapter/chapter.html'
    }).
     when('/home', {
        controller: "HomeCtrl",
        templateUrl: 'app/directives/home.html'
    }).
    otherwise({
        redirectTo: '/home'
    });
});

app.directive('userAvatar', function() {
    return {
        link: function(scope, element, attrs) {
            var placeholder = 'images/grid_img.jpg';

            scope.$watch(function() {
                return attrs.ngSrc;
            }, function (value) {
                if (!value) {
                    element.attr('src', placeholder);  
                }
            });

            element.bind('error', function() {
                element.attr('src', placeholder);  
            });
        }
    };
});

app.controller('HomeCtrl' , function($scope, $http,$routeParams,$location){
	
	//
		 var inputMin = 4;
		$scope.currentorder = 'date';
		$scope.orderBy  = $scope.currentorder;
		var vm = this;
		vm.tiles = []; //declare an empty array
		vm.availableSorts = [{"name" : "Title A-Z" , "value" : "t"}, {"name":"Hits" , "value":"h"}];
		vm.pageNo = 0; // initialize page no to 1
		vm.totalCount = 0;
		vm.itemsPerPage = 36;
		vm.getData = function(pageNo){ 
			var it, results = [ ];
			var APIItems = null ;
			var tileTmpl = [{ image : "",title: "",background: ""}];
			$http.get("data.json/list_s_0.json")
			.then(function (response) {
				APIItems = response.data.manga;
				vm.totalCount = response.data.total;
				j=0;
				for(val in response.data.manga){
					// remove the products which not having images
					if(typeof APIItems[val].im == "undefined" ||  APIItems[val].im == null)
					{
						continue;
					}
					it = angular.extend({},tileTmpl);
					it.image  = APIItems[val].im;
					it.date = APIItems[val].it;
					it.hits = APIItems[val].h;
					it.title = APIItems[val].t;
					it.i = APIItems[val].i;
					it.cats = APIItems[val].c;
					
					it.span  = { row : 1, col : 1 };
					it.info = APIItems[val];
					switch((j+1)%10) {
					  case 1:it.background = "red";				break;
					  case 2: it.background = "green";         	break;
					  case 3: it.background = "darkBlue";      	break;
					  case 4: it.background = "blue";			break;
					  case 5: it.background = "yellow";			break;
					  case 6: it.background = "pink";          break;
					  case 7: it.background = "darkBlue";      break;
					  case 8: it.background = "purple";        break;
					  case 9: it.background = "deepBlue";      break;
					  case 10: it.background = "lightPurple";  break;
					}
					results.push(it);
					j++;  
				}
				$scope.tiles =  results;
				vm.tiles  = results;
			});
			
		};
		vm.getData(vm.pageNo);

		$scope.goto_detail = function(id) {
			$location.url('/detail/' + id);
		};
		$scope.onOrderChange = function(){
			$scope.currentorder = $scope.orderBy;
		}
  
  		$http.get("https://www.mangaeden.com/api/list/1/?p=0&l=30")
			.then(function (response) {
			$scope.latestManga = response.data.manga;
        });
		
		
});

app.controller('DetailCtrl', function($scope, $http,$routeParams,$location) {
	mangaId = $routeParams.id;
	$http.get("https://www.mangaeden.com/api/manga/"+mangaId+"/")
	.then(function (response) {
		$scope.manga = response.data;	
	});
	
	$scope.gotoList = function(id) {
			$location.url('/list/');
		};
	$scope.gotoChapter = function(id){
		$location.url('/chapter/'+mangaId+"/"+id);
	};
	
})
.filter('trustAs', ['$sce', 
    function($sce) {
        return function (input, type) {
            if (typeof input === "string") {
                return $sce.trustAs(type || 'html', input);
            }
            console.log("trustAs filter. Error. input isn't a string");
            return "";
        };
    }
]);

app.controller('ChapterCtrl', function($scope, $http,$routeParams,$location,$window) {
	mangaId = $routeParams.mangaId;
	chapterId = $routeParams.chapterId;
	$scope.chapterId = chapterId;
	$scope.chapter = chapterId;
	$scope.dataShow = [];
	$http.get("https://www.mangaeden.com/api/chapter/"+chapterId+"/")
	.then(function (response) {
		
		// chapter = response.data;	
		var chapterData = [];
		response.data.images.forEach(function(val){
			cdata = {"index":val[0] , "image" : val[1]};
		   chapterData.unshift(cdata);
		});

		$scope.dataSet = chapterData;
		$scope.current = $scope.dataSet[0];
		$scope.dataShow.push($scope.current);
		
		/* custom code added for lazy load effect*/
		var i = 0;
		jQuery( ".chapter-pages" ).scroll(function() {
			jQuery(".chapter-pages img.lazy-load:not(.lazy-loaded)").each(function(){
				if($(this).position().top - $(this).parent().height() < - ($(this).parent().height()/2)){
					jQuery(this).attr('src' ,jQuery(this).attr('data-src'));
					jQuery(this).addClass('lazy-loaded');
				}
			});
		});
		/* custom code added for lazy load effect : ends*/
	});
	$http.get("https://www.mangaeden.com/api/manga/"+mangaId+"/")
	.then(function (response) {
		$scope.manga = response.data;	
	});
	
	
    $scope.next = function(){
    	if($scope.current){
			var i = $scope.getIndex($scope.current.index, 1);
			$scope.current = $scope.dataSet[i];
			$scope.dataShow.push($scope.current);
        }
    };
    $scope.previous = function(){
        var i = $scope.getIndex($scope.current.index, -1);
        $scope.current = $scope.dataSet[i];
    };
    $scope.getIndex = function(currentIndex, shift){
        var len = $scope.dataSet.length;
        return (((currentIndex + shift) + len) % len)
    };
    
	$scope.gotoList = function(id) {
			$location.url('/list/');
	};
	$scope.gotoManga = function(id) {
			$location.url('/detail/'+mangaId);
	};
	$scope.onChapterChange = function(){
		$scope.chapter;
		$location.url('/chapter/'+mangaId+"/"+$scope.chapter);
	};
	
});
  app.controller('listCtrl', function($scope, $http,$location) {
		$scope.currentorder = 'date';
		$scope.orderBy  = $scope.currentorder;
		var vm = this;
		vm.tiles = []; //declare an empty array
		vm.availableSorts = [{"name" : "Title A-Z" , "value" : "t"}, {"name":"Hits" , "value":"h"}];
		vm.pageNo = 0; // initialize page no to 1
		vm.totalCount = 0;
		vm.itemsPerPage = 36;
		vm.getData = function(pageNo){ 
			var it, results = [ ];
			var APIItems = null ;
			var tileTmpl = [{ image : "",title: "",background: ""}];
			$http.get("data.json/list_s_0.json")
			.then(function (response) {
				console.log(response);
				APIItems = response.data.manga;
				vm.totalCount = response.data.total;
				j=0;
				for(val in response.data.manga){
					it = angular.extend({},tileTmpl);
					it.image  = APIItems[val].im;
					it.date = APIItems[val].it;
					it.hits = APIItems[val].h;
					it.title = APIItems[val].t;
					it.i = APIItems[val].i;
					it.cats = APIItems[val].c;
					
					it.span  = { row : 1, col : 1 };
					it.info = APIItems[val];
					switch((j+1)%10) {
					  case 1:it.background = "red";				break;
					  case 2: it.background = "green";         	break;
					  case 3: it.background = "darkBlue";      	break;
					  case 4: it.background = "blue";			break;
					  case 5: it.background = "yellow";			break;
					  case 6: it.background = "pink";          break;
					  case 7: it.background = "darkBlue";      break;
					  case 8: it.background = "purple";        break;
					  case 9: it.background = "deepBlue";      break;
					  case 10: it.background = "lightPurple";  break;
					}
					results.push(it);
					j++;  
				}
				$scope.tiles =  results;
				vm.tiles  = results;
			});
			
		};
		vm.getData(vm.pageNo);

		$scope.goto_detail = function(id) {
			$location.url('/detail/' + id);
		};
		$scope.onOrderChange = function(){
			$scope.currentorder = $scope.orderBy;
		}
  });

var footer = angular.module('Footer', ['ngMaterial', 'ngMdIcons']);
footer.controller('FooterController', ['$scope', function($scope) {
}])
.directive('mangaFooter', function() {
  return {
    templateUrl: 'app/directives/footer.html'
  };
});


angular.bootstrap(document.getElementById("AppContent"), ['MangaApp']);
angular.bootstrap(document.getElementById("FooterApp"), ['Footer']);