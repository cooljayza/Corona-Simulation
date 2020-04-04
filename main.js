// CHANGE THE INITIAL SEED HERE


class Person{

     constructor(pos,age,direction,status,speed){
        this.age = age;
        this.position = pos;
        this.status = status;
        this.speed = speed;
        this.dx = Math.sin(direction) + speed;
        this.dy = Math.cos(direction) + speed;
    }

    setAge (newAge) {this.age = newAge;}

    setPosition (newPos) {this.position = newPos;}

    setStatus(newStatus){this.status = this.status;}

    setSpeed(newSpeed){this.speed = newSpeed;}

    setDy(newDy){this.dy = newDy;}

    setDx(newDx){this.dx = newDx;}

    getAge(){ return this.age;}

    getDx(){return this.dx;}

    getDy(){return this.dy;}

    getSpeed(){return this.speed;}

    getStatus(){return this.status;}

    getPosition(){return this.position;}
}

var colorDict = {1:"white",2:"orange",3:"black"};

function drawCircle(canvas,person){
    var x = person.getPosition()[0];
    var y = person.getPosition()[1];
    canvas.beginPath();
    canvas.arc(x,y,3,0,2*Math.PI);
    canvas.fillStyle = colorDict[person.getStatus()];
    canvas.fill();
    canvas.lineWidth = 1;
    canvas.strokeStyle = '#003300';
    canvas.stroke();
};

let ctx =  document.getElementById("my_canvas").getContext("2d");


var healedHistory = [];
var diedHistory = [];
var healthyHistory = [];
var infectedHistory = [];
var canvas = document.getElementById("my_canvas");
function initialise(nPeople) {
    var people = [];
    infectedHistory = [];
    diedHistory = [];
    healedHistory = [];
    healthyHistory = [];
    for(var a = 0;a < nPeople;a++)
    {
        var y = Math.floor(Math.random()*589) + 10;
        var x = Math.floor(Math.random()*589) + 10;
        var color = null;
        if(Math.random() *100 < 0.2){
            color = 3;
        }
        else{
            color = 1;
        }
        var age = Math.floor(Math.random() * 110);
        var pos = [x,y];
        var dir = Math.random() * 365 + 1;
        var speed = Math.floor(Math.random()*4) + 1;
        var newPerson = new Person(pos,age,dir,color,speed);
        people.push(newPerson);
        drawCircle(ctx,newPerson);
    }
    var centerX = canvas.width/2;
    var centerY = canvas.height/2;
    var centerPos = [centerX,centerY];
    var infectedPerson = new Person(centerPos,34,218,3,2);
    infectedPerson.infectedPeriod = - 20;
    people.push(infectedPerson);
    healed = 0;
    infected = 1;
    died = 0;
    healthy = nPeople - 1;
    return people;
}

var timer;
var people;
var healthy;
var counts;
function startSimulation(e) {
    var nPeople = e.value;
    people = initialise(nPeople);
    var speedControl = document.getElementById('speed');
    speedControl.value = 0;
    prevVal = 0;
    counts = []
    var total = people.length;
    if(timer !== null){
        stopSimulation();
    }
    timer = setInterval(function(){
        clearCanvas();
        checkPeopleCollision();
        updateStatus();
        var infected = 0;
        for(var a = 0;a < people.length;a++){
            var person = people[a];
            var currentX = person.getPosition()[0];
            var currentY = person.getPosition()[1];
            //Check for collision with the bounding box
            //Check left  and right collisions
            
            dx = person.getDx();
            dy = person.getDy();
    
            if(currentX + dx <= 0 || currentX + dx >= canvas.width){
                person.setDx(-dx);
            }
            //Check up and down collisions
            if(currentY + dy <= 0 || currentY + dy >= canvas.height){
                person.setDy(-dy);
            }
            
            var currentSpeed = people[a].getSpeed();
            var newX = currentX + dx;
            var newY = currentY + dy;
            person.setPosition([newX,newY]);
            if(person.status == 3){infected ++;}
            drawCircle(ctx,person);
        }
        //update the chart every one second
        if(Math.floor(counter % 33.33) == 0){
            healedHistory.push(healed);
            healthyHistory.push(healthy);
            diedHistory.push(died);
            infectedHistory.push(infected);
            counts.push(Math.round(counter / 33,2));
        }
        updateChart();
        document.getElementById("Recovered").innerText = "" + healed + " people Recovered";
        document.getElementById("Infected").innerText = "" + infected + "  people Infected";
        document.getElementById("Died").innerText = "" +  died + " Dead people";
        healthy = total - (healed + infected + died);
        document.getElementById("Healthy").innerText = "" + healthy + " Healthy people."
        if(infected === people.length || infected === 0){
            clearInterval(timer);
        }
        counter++;
    },30)
}
function clearCanvas() {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

function stopSimulation() {
    clearInterval(timer);

}

var counter = 0;
var died = 0;

function checkPeopleCollision(){
    for(a = 0;a < people.length;a++){
        for(b = a;b < people.length;b++){
            personA = people[a];
            personB = people[b];
            //check collision within x-axis
            var diffX = personA.getPosition()[0] - personB.getPosition()[0]
            var diffY = personA.getPosition()[1] - personB.getPosition()[1]
            if(Math.abs(diffX) <= 4 && Math.abs(diffY) <= 4){
                personA.setDx(-personA.getDx());
                personA.setDy(-personA.getDy());
                personB.setDx(-personB.getDx());
                personB.setDy(-personB.getDy());
                if(personB.getStatus() === 3 || personA.getStatus() === 3){
                    if(personB.status !== 3){
                        personB.infectedPeriod = 0;
                        personB.status = 3;
                    }
                    if(personA.status !== 3){
                        personA.infectedPeriod = 0;
                        personA.status = 3;
                    }
                    
                }
            }
        }
    }
}
var healed = 0;
function updateStatus(){
    var toRemove = [];
    healed = 0
    for(var a = 0;a < people.length;a++){
        var person = people[a];
        //Kill
        if(person.status == 3 && person.getAge() > 80){
            toRemove.push(person);
        }
        //Heal
        if(person.status === 3 ){
            if(person.infectedPeriod === 30*40){
                person.status = 2;
            }
            person.infectedPeriod += 1;
        }
        if(person.status === 2){
            healed ++;
        }
    }
    if(toRemove.length > 0){
        for(var a = 0;a < toRemove.length;a++){
            people = people.filter((x) => x !== toRemove[a]);
            died ++;
        }
    }

}
var prevVal = 0;
function adjustSpeed(e) {
    var change = e.value - prevVal;
    prevVal = e.value;
    for(var a = 0;a < people.length;a++){
        var person = people[a];
        person.dx = person.dx + (person.dx - Math.abs(person.dx - 1)) * change;
        person.dy = person.dy + (person.dy - Math.abs(person.dy - 1)) * change;
    }
}

function updateChart() {
    if(healedHistory.length > 250){
        config.data.datasets[0].data = healthyHistory.slice(-250,-1);
        config.data.datasets[1].data = infectedHistory.slice(-250,-1);
        config.data.datasets[2].data = diedHistory.slice(-250,-1);
        config.data.datasets[3].data = healedHistory.slice(-250,-1);
        config.data.labels = counts.slice(-250,-1);
    }
    else{
        config.data.datasets[0].data = healthyHistory;
        config.data.datasets[1].data = infectedHistory;
        config.data.datasets[2].data = diedHistory;
        config.data.datasets[3].data = healedHistory;
        config.data.labels = counts;
    }
    stackedLine.update();
}

var ctx1 = document.getElementById('myChart').getContext('2d');
var config = {
    type: 'line',
    data: {
        labels: counts,
        datasets: [{
            label: 'Healthy',
            backgroundColor: 'white',
            borderColor: 'white',
            data: [1],
        }, {
            label: 'Infected',
            backgroundColor: "black",
            borderColor: 'black',
            data: [0],
        }, {
            label: 'Dead',
            backgroundColor: 'red',
            borderColor: 'red',
            data: [2],
        }, {
            label: 'Recovered',
            backgroundColor: 'orange',
            borderColor: 'orange',
            data: [3],
        }]
    },
    options: {
        title: {
            text: 'Chart.js Time Scale'
        },
        elements: {
            point:{
                radius: 0
            }
        },
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                }
            }],
            yAxes: [{
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Value'
                }
            }]
    }}
};
var stackedLine = new Chart(ctx1,config);
stackedLine.update();






