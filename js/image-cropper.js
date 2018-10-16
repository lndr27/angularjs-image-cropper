angular.module('imageCropperModule', [])
    .controller('test', ['$scope', function ($scope) {
        $scope.foo = function(src, blob) {
            debugger;
        };
    }])
    .directive('imageCropper', ['$compile', '$q', function ($compile, $q) {

        var link = function ($scope, $element, $attrs, $ctrl) {

            $scope.src = null;

            $scope.base64CroppedImage = null;

            $scope.blobCroppedImage = null;

            $scope.resizer = pica({ features: ['js', 'wasm', 'ww', 'cib'] });

            $scope._crop = _crop.bind(null, $scope);

            $scope.image = $element.find('img')[0];

            $element.find('input').on('change', inputFileChange.bind(null, $scope));

            $scope.$watch('src', loadCropper.bind(null, $scope));
        };

        var inputFileChange = function ($scope, changeEvent) {
            blobToBase64(changeEvent.target.files[0])
            .then(function(base64) {
                $scope.src = base64;
            });
        };

        var loadCropper = function ($scope) {
            if ($scope.cropper) {
                $scope.cropper.destroy();
            }
            $scope.cropper = new Cropper($scope.image, {
                aspectRatio: 1,
                viewMode: 1
            });
        };

        var _crop = function ($scope) {
            resizeToBlob.call(null, $scope);
        };

        var resizeToBlob = function ($scope) {
            var canvasDest = document.createElement('canvas');
            $scope.resizer.resize($scope.cropper.getCroppedCanvas(), canvasDest, {
                unsharpAmount: 80,
                unsharpRadius: 0.6,
                unsharpThreshold: 2
            })
            .then(function (result) { return $scope.resizer.toBlob(result, 'image/jpeg', 0.8); })
            .then(function (blob) {
                $scope.$apply(function () {
                    $scope.blobCroppedImage = blob;
                });
                return blobToBase64(blob);
            })
            .then(function(base64) {
                $scope.$apply(function () {
                    $scope.base64CroppedImage = base64;
                });
                $scope.crop({ src: base64, blob: $scope.blobCroppedImage });
                canvasSrc = canvasDest = null;
            });
        };

        var blobToBase64 = function(blob) {
            return $q(function(resolve) {
                var reader = new FileReader();
                reader.readAsDataURL(blob); 
                reader.onload = function() {
                    resolve(reader.result);
                }
            });
        };

        return {
            restrict: 'A',
            transclude: true,
            scope: {
                crop: '&'
            },
            template: '' +
                '<img ng-src="{{ src }}" id="baz"/>' +
                '<input type="file" />' +
                '<button ng-click="_crop()">Crop</button>',
            link: link
        };;
    }]);