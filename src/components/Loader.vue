<template>
    <div class="wrapper_rol">
        <div class="circle_rol">
            <div class="ball_rol ball_rol1"></div>
            <div class="ball_rol ball_rol2"></div>
            <div class="ball_rol ball_rol3"></div>
            <div class="ball_rol ball_rol4"></div>
            <div class="ball_rol ball_rol5"></div>
            <div class="ball_rol ball_rol6"></div>
        </div>
    </div>
</template>
<style>
.wrapper_rol {
 width: 200px;
 height: 200px;
 display: flex;
 justify-content: center;
 align-items:center;
 background: black;
 color: white;
 margin: 0 auto;
}
.circle_rol {
 position: relative;
 width: 120px;
 height: 120px;
 border-radius: 50%;
 /* border: 0.5px dotted #999; */
} 
.ball_rol {
 position: absolute;
 width: 10px;
 height: 10px;
 margin-top: -5px;
 margin-left: -5px;
 top: 50%;
 left: 50%;
 border-radius: 50%;
 background: #ddd;
}
.ball_rol1 {
 animation: animate 1.5s cubic-bezier(0.75,0.33,0.66,1) infinite;   
}
.ball_rol2 {
 animation: animate 1.5s cubic-bezier(0.6,0.33,0.66,1) infinite;
}
.ball_rol3 {
 animation: animate 1.5s cubic-bezier(0.45,0.33,0.66,1) infinite;
}
.ball_rol4 {
 animation: animate 1.5s cubic-bezier(0.3,0.33,0.66,1) infinite;
}
.ball_rol5 {
 animation: animate 1.5s cubic-bezier(0.15,0.33,0.66,1) infinite;
}
.ball_rol6 {
 animation: animate 1.5s cubic-bezier(0,0.33,0.66,1) infinite;
}
@keyframes animate {
 from {
  transform: rotate(0deg) translateY(-60px);
 }
 to {
  transform: rotate(360deg) translateY(-60px);
 }
}
</style>