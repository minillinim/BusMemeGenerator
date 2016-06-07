var app = angular.module('bus-meme');

app.controller('TimeController', function ($scope, $rootScope) 
{
    var weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    $scope.ampms = ["am", "pm"];

    $scope.days = getSevenDays();
    $scope.selectedDate = $scope.days[0];

    $scope.hours = getHours();
    $scope.minutes = getMinutes();
    $scope.walkingOptions = getWalkingOptions();

    setSelectedTime();
       
    $scope.timeOption = 'after';

    $scope.selectedMaxWalk = $scope.walkingOptions[4];

    $rootScope.getMaxWalk = function() { return $scope.selectedMaxWalk.value; }
    $rootScope.getTimeOption = function() { return $scope.timeOption; }

    $rootScope.formattedTimeOption = function(){
        var time = $scope.selectedHour + ':' + $scope.selectedMinute + $scope.selectedAmpm;

        switch( $scope.getTimeOption()){
            case "before":
                return "Arriving Before " + time;
            case "after":
                return "Leaving After " + time;
            case "first":  
                return "First Service"; 
            case "last":  
                return "Last Service"; 
        }
    }
    $rootScope.formattedDate = function(){
        var date = $scope.selectedDate.dateValue;
        
        return weekdays[date.getDay()].substr(0,3) + ' ' + 
               date.getDate() + ' ' + 
               months[date.getMonth()] + ' ' +
               date.getFullYear();
    }
    $rootScope.getSelectedTime = function(){

        var hour = $scope.selectedHour;
        if ($scope.selectedAmpm == 'pm')
            hour += 12;

        var date = new Date($scope.selectedDate.dateValue.getFullYear(), 
                        $scope.selectedDate.dateValue.getMonth(),
                        $scope.selectedDate.dateValue.getDate(),
                        hour,
                        $scope.selectedMinute,
                        0,0);

        return date;
    }

    function getSevenDays(){
        days = [];

        var date = new Date();
        days.push({label:'Today (' + weekdays[date.getDay()] + ')', dateValue:new Date(date)})
        for (var i = 0; i < 6; i++) {
            date.setDate(date.getDate() + 1);
            days.push({label:getDateDisplayLabel(date), dateValue:new Date(date)});
        }

        return days;
    }

    function getHours(){
        var hours = [];

        for (var i=1; i<=12; i++){
            hours.push(i);
        }

        return hours;
    }

    function getMinutes(){
        var minutes = [];

        for (var i=0; i<12; i++){
            var thisMinute = i * 5;

            if (thisMinute==60) 
                thisMinute = 0;

            minutes.push(twoDigits(thisMinute));
        }

        return minutes;
    }
    function setSelectedTime(){
        var date = new Date();

        var hour = date.getHours();

        var roundedMinute = (Math.ceil(date.getMinutes() / 5) * 5);

        if (roundedMinute == 60) {
            roundedMinute = 0;
            hour++;
        }

        $scope.selectedAmpm = $scope.ampms[0];
        
        if (hour > 11) {
            $scope.selectedAmpm = $scope.ampms[1];
        }
        if (hour > 12) {
            hour = hour - 12;
        }

        if (hour == 0){
            hour = 12;
            $scope.selectedAmpm = $scope.ampms[0];
        
        }

        $scope.selectedMinute = $scope.minutes[roundedMinute / 5];
        $scope.selectedHour = $scope.hours[hour - 1];
    }
    function twoDigits(digit){
        if (digit < 10)
            return '0' + digit.toString();
        return digit.toString();
    }
    function getDateDisplayLabel(date){
        return weekdays[date.getDay()].substr(0,3) + ' ' + 
               date.getDate() + ' ' + 
               months[date.getMonth()] + ' ' +
               date.getFullYear();
    }

    function getWalkingOptions(){
        var walkingOptions = [
            {label:'Up to 100m', value:'100'},
            {label:'Up to 250m', value:'250'},
            {label:'Up to 500m', value:'500'},
            {label:'Up to 1km', value:'1000'},
            {label:'Up to 1.5km', value:'1500'},
            {label:'Up to 2km', value:'2000'},
            {label:'Up to 4km', value:'4000'}
        ];

        return walkingOptions;
    }
});
