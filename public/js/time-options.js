var app = angular.module('bus-meme');

app.controller('TimeController', function ($scope) 
{
    var weekdays = ["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    $scope.ampms = ["am", "pm"];

    $scope.days = getSevenDays();
    $scope.selectedDate = $scope.days[0];

    $scope.selectedAmpm = $scope.ampms[0];

    $scope.hours = getHours();
    $scope.selectedHour = $scope.hours[0];

    $scope.minutes = getMinutes();
    $scope.selectedMinute = $scope.minutes[0];

    $scope.timeOption = 1;
    
    $scope.showMap = false;

    function getSevenDays(){
        days = [];

        var date = new Date();
        days.push({label:'Today (' + weekdays[date.getDay()] + ')', dateValue:date})
        
        for (var i = 0; i <= 6; i++) {
            date.setDate(date.getDate() + 1);
            days.push({label:getDateDisplayLabel(date), dateValue:date});
        }

        return days;
    }

    function getHours(){
        var hours = [];
        var hourNow = new Date().getHours();
        if (hourNow > 12) {
            hourNow -=12;
            $scope.selectedAmpm = $scope.ampms[1];
        }
        hours.push(hourNow);

        for (var i=0; i<11; i++){
            hourNow++;
            if (hourNow>12)hourNow = 1;
            hours.push(hourNow);
        }
        return hours;
    }

    function getMinutes(){
        var minutes = [];

        var thisMinute = Math.ceil(new Date().getMinutes() / 10) * 10;

        minutes.push(twoDigits(thisMinute));

        for (var i=0; i<5; i++){
            thisMinute+=10;
            if (thisMinute>=60) thisMinute = 0;
            minutes.push(twoDigits(thisMinute));
        }
        return minutes;
    }
    function twoDigits(minute){
        if (minute === 0)
            return '00';
        return minute.toString();
    }
    function getDateDisplayLabel(date){
        return weekdays[date.getDay()].substr(0,3) + ' ' + 
               date.getDate() + ' ' + 
               months[date.getMonth()] + ' ' +
               date.getFullYear();
    }
});
