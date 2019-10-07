var canvasWidth = Math.min(800, $(window).width() -20)
var canvasHeight = canvasWidth;

//检测用户是否按下了鼠标
var isMouseDown = false
//上一次鼠标所在的位置
var lastloc = {x:0,y:0}

//上一次的时间戳
var lastTimestamp=0

var lastLineWidth = -1

//当前绘制的颜色
var strokeColor ="black"

var canvas = document.getElementById("mycanvas");
var context = canvas.getContext("2d")


// 设置canvas的大小
canvas.width = canvasWidth;
canvas.height = canvasHeight;

$("#controller").css("width",canvasWidth+"px")
drawGrid()

//清除按钮的js
$("#clear_btn").click(function (e) {
   context.clearRect(0,0,canvasWidth,canvasHeight)
    drawGrid()
});


//选择画笔颜色按钮
$(".color_btn").click(function (e) {
    $(".color_btn").removeClass("color_btn_selected")
    $(this).addClass("color_btn_selected")
    strokeColor = $(this).css("background-color")
});




//鼠标事件
canvas.onmousedown = function (e) {
    e.preventDefault();
    beginStroke({x: e.clientX, y: e.clientY})
};

function beginStroke(point){
    isMouseDown = true
    //canvas中的坐标值
    lastloc = windowToCanvas(point.x,point.y)
    lastTimestamp = new Date().getTime()

}

canvas.onmouseup = function (e) {
    e.preventDefault();
    endStroke()

};

canvas.onmouseout = function (e) {
    e.preventDefault();//阻止默认的响应行为
    endStroke()

};

function endStroke(){
    isMouseDown = false

}


canvas.onmousemove = function (e) {
    e.preventDefault();
    if(isMouseDown){
        //本次鼠标的位置
       moveStroke({x: e.clientX,y: e.clientY})
    }
};


function moveStroke(point) {
    let curLoc = windowToCanvas(point.x,point.y)
    let curTimestamp = new Date().getTime()
    let s = calcDistance(curLoc,lastloc)
    let t = curTimestamp -  lastTimestamp

    let lineWidth  = calcLineWidth (t,s)


    //draw
    context.beginPath()
    context.moveTo(lastloc.x,lastloc.y)
    context.lineTo(curLoc.x,curLoc.y)

    context.strokeStyle = strokeColor
    context.lineWidth = lineWidth
    context.lineCap = "round"
    context.lineJoin = "round"
    context.stroke()


    lastloc = curLoc;
    lastTimestamp = curTimestamp;
    lastLineWidth =  lineWidth
}

//线条的参数
var maxLineWidth = 30;
var minLineWidth=1;
var maxStrokeV = 10;
var minStokeV = 0.1;


//根据运笔速度计算线条的粗细
function calcLineWidth(t,s) {
    let v = s/t
    let resultLineWidth
    if(v <= minStokeV){
        resultLineWidth = maxLineWidth
    }else if (v >= maxStrokeV){
        resultLineWidth = minLineWidth
    }else {
        resultLineWidth = maxLineWidth - (v-minStokeV)/(maxStrokeV-minStokeV)*(maxLineWidth-minLineWidth)
    }

    if(lastLineWidth == -minLineWidth){
        return resultLineWidth
    }
    return lastLineWidth*2/3+resultLineWidth*minLineWidth/3
}

//计算运笔速度对画笔的影响:平方和开根 [这个函数计算的是距离（路程）]
function calcDistance(loc1,loc2) {
    return Math.sqrt((loc1.x - loc2.x)*(loc1.x - loc2.x) + (loc1.y-loc2.y)*(loc1.y-loc2.y))
}

//浏览器的坐标和canvas坐标转换
function windowToCanvas(x,y) {
    let bbox=  canvas.getBoundingClientRect()//获取包围盒
    return {
        x: Math.round(x-bbox.left),
        y: Math.round(y-bbox.top)
    }
}

//画米字格
function drawGrid() {
    context.save()//保存最原始的状态，不影响之后的绘制

//绘制米字格边框
    context.strokeStyle = "rgb(230,11,9)"

    context.beginPath()
    context.moveTo(3,3)
    context.lineTo(canvasWidth-3,3)
    context.lineTo(canvasWidth-3,canvasHeight-3)
    context.lineTo(3,canvasHeight-3)
    context.closePath()

    context.lineWidth = 6
    context.stroke()

    context.beginPath()
    context.moveTo(0,0)
    context.lineTo(canvasWidth,canvasHeight)

    context.moveTo(canvasWidth,0)
    context.lineTo(0,canvasHeight)

    context.moveTo(canvasWidth/2,0)
    context.lineTo(canvasWidth/2,canvasHeight)

    context.moveTo(0,canvasHeight/2)
    context.lineTo(canvasWidth,canvasHeight/2)

    context.lineWidth=1
    context.stroke()

    context.restore()
}


/**
 * Touch触控事件【移动端】
 */
canvas.addEventListener('touchstart',function (e) {
    e.preventDefault();
    touch = e.touches[0];//取多点触控的一个。【多个手指取一个手指】
    beginStroke({x: touch.pageX, y: touch.pageY})

});

canvas.addEventListener('touchmove',function (e) {
    e.preventDefault();
    if(isMouseDown){
        touch= e.touches[0]
        moveStroke({x: touch.pageX,y:touch.pageY})
    }
});

canvas.addEventListener('touchend',function (e) {
    e.preventDefault();
    endStroke()
});
