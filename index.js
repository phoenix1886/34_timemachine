var TIMEOUT_IN_SECS = 60 * 3
var NOTIFICATION_INTERVAL_IN_SECS = 30
var NOTIFICATIONS = [
  'Хватит прокрастинировать, пора дела делать!',
  'Нормально делай, нормально будет!',
  'Код сам себя не напишет, Валли совсем заскучала!',
  'Делу время, потехе час.'
]
var TEMPLATE =
  '<h1><span class="js-timer-minutes">00</span>:<span class="js-timer-seconds">00</span></h1>'

function padZero(number){
  return ("00" + String(number)).slice(-2);
}

class Timer{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  constructor(timeout_in_secs){
    this.initial_timeout_in_secs = timeout_in_secs
    this.reset()
  }
  getTimestampInSecs(){
    var timestampInMilliseconds = new Date().getTime()
    return Math.round(timestampInMilliseconds/1000)
  }
  start(){
    if (this.isRunning)
      return
    this.timestampOnStart = this.getTimestampInSecs()
    this.isRunning = true
  }
  stop(){
    if (!this.isRunning)
      return
    this.timeout_in_secs = this.calculateSecsLeft()
    this.timestampOnStart = null
    this.isRunning = false
  }
  reset(timeout_in_secs){
    this.isRunning = false
    this.timestampOnStart = null
    this.timeout_in_secs = this.initial_timeout_in_secs
  }
  calculateSecsLeft(){
    if (!this.isRunning)
      return this.timeout_in_secs
    var currentTimestamp = this.getTimestampInSecs()
    var secsGone = currentTimestamp - this.timestampOnStart
    return this.timeout_in_secs - secsGone
  }
}

class TimerWidget{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  construct(){
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
  mount(rootTag){
    if (this.timerContainer)
      this.unmount()

    // adds HTML tag to current page
    this.timerContainer = document.createElement('div')

    this.timerContainer.innerHTML = TEMPLATE
    this.timerContainer.setAttribute("style", "border: solid 2px darkgrey; padding: 5px; width: 120px; margin: 1px; background-color: lightgrey; position: fixed; top:37px; left: 55px; z-index: 1")
    this.timerContainer.getElementsByTagName('h1')[0].setAttribute("style", "margin: 0; color: white; text-align: center")

    rootTag.insertBefore(this.timerContainer, rootTag.firstChild)

    this.minutes_element = this.timerContainer.getElementsByClassName('js-timer-minutes')[0]
    this.seconds_element = this.timerContainer.getElementsByClassName('js-timer-seconds')[0]
  }
  update(secsLeft){
    var minutes = Math.floor(secsLeft / 60);
    var seconds = secsLeft - minutes * 60;

    this.minutes_element.innerHTML = padZero(minutes)
    this.seconds_element.innerHTML = padZero(seconds)
  }
  unmount(){
    if (!this.timerContainer)
      return
    this.timerContainer.remove()
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
}


function main(){

  var timer = new Timer(TIMEOUT_IN_SECS)
  var timerWiget = new TimerWidget()
  var intervalId = null

  timerWiget.mount(document.body)

  function startNotification(notification_interval) {
      timer = new Timer(notification_interval);
      secsLeft = timer.calculateSecsLeft();
      timer.start();
  }

  function randomInt(ceiling) {
    return Math.floor(Math.random()*ceiling);
  }

  function showRandomNotification() {
    var random_notification = NOTIFICATIONS[randomInt(NOTIFICATIONS.length)];
    window.alert(random_notification);
  }

  function handleIntervalTick(){
    var secsLeft = timer.calculateSecsLeft()
    if (secsLeft < 0){
      showRandomNotification();
      startNotification(NOTIFICATION_INTERVAL_IN_SECS)
    }
    else {
      timerWiget.update(secsLeft)
    }
  }

  function handleVisibilityChange(){
    if (document.hidden) {
      timer.stop()
      clearInterval(intervalId)
      intervalId = null
    } else {
      timer.start()
      intervalId = intervalId || setInterval(handleIntervalTick, 300)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  handleVisibilityChange()
}

// initialize timer when page ready for presentation
window.addEventListener('load', main)
