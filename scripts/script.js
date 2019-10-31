////////////////////////////////////////////////////////////////////////////////
//
//  Note: a lot of the functionality in class Slider may be overkill for the purposes
//  of creating a full-page slider. However, it has been left as is* inorder to allow
//  for the possibility of creating variations -if needed.
//
//  * updateIndicator has been modified as noted below.
//
////////////////////////////////////////////////////////////////////////////////



class Slider {
  constructor(sliderId, options = {}) {
    this.slider             = document.getElementById(sliderId);
    this.currentSlideNumber = options.currentSlideNumber || 1; //Could break if not validated.
    this.useIndicators      = (options.useIndicators  === false) ? false : true;
    this.useControllers     = (options.useControllers === false) ? false : true;
    this.makeAuto           = (options.makeAuto       === true ) ? true  : false;
    this.autoSpeed          = options.autoSpeed || 6000;       //Could break if not validated.
    this.pauseOnHover       = (options.pauseOnHover   === false) ? false : true;
    this.isChanging         = false;
    this.init();
  }


  /* ===========================================================================
                                init()
  =========================================================================== */


  init(){
    const self         = this;
    const initialSlide = self.slider.querySelector(`[data-slide="${self.currentSlideNumber}"]`);
    let indicators;


    if (self.useIndicators) {
      indicators = self.slider.getElementsByClassName('indicator');
    }


    /* ==============================
       setInitialSlideandIndicator
    ============================== */


    (function setInitialSlideandIndicator(){
      initialSlide.classList.add('new-slide');
      if (self.useIndicators) {
        indicators[self.currentSlideNumber-1].classList.add('active');
      }
    })();


    /* ==============================
       addIndicatorEventListeners
    ============================== */


    (function addIndicatorEventListeners() {
      if (self.useIndicators) {
        for (let i = 0; i < indicators.length; i++){
          let indicator = indicators[i];

          indicator.addEventListener('click', function(e){
            e.preventDefault();
            self.indicateSlide(e);
          });
        }
      }
    })();//End of IIFE


    /* ==============================
       addControllerEventListeners
    ============================== */


    (function addControllerEventListeners() {
      if (self.useControllers) {
        const previousController = self.slider.getElementsByClassName('previous-controller')[0];
        const nextController     = self.slider.getElementsByClassName('next-controller')[0];


        previousController.addEventListener('click', function(e){
          e.preventDefault();
          self.getPreviousSlide();
        });


        nextController.addEventListener('click', function(e){
          e.preventDefault();
          self.getNextSlide();
        });
      }
    })();//End of IIFE


    /* ==============================
            setAutomation
    ============================== */


    (function setAutomation() {
      if (self.makeAuto) {
        const x       = () => self.getNextSlide();
        let getNext   = setInterval(x, self.autoSpeed);

        if (self.pauseOnHover){
          //Note: mouseover/mouseout would call event listeners repeatedly.
          self.slider.addEventListener('mouseenter', function(){
            clearInterval(getNext);
          });

          self.slider.addEventListener('mouseleave', function(){
            getNext = setInterval(x, self.autoSpeed);
          });
        }
      }
    })();//End of IIFE
  }//End of init(){ ... }


  /* ===========================================================================
                          updateIndicator
  =========================================================================== */
  //This method is used within getPreviousSlide, getNextSlide, and indicateSlide.


  //////////////////////////////////////////////////////////////////////////////
  //
  //  Note:
  //
  //  The original implementation used position:absolute on the single .indicator-container.
  //  This meant that when the user scrolls the slide, the indicators remained in the same position.
  //  However, this is not what I want when making a full-page slider.
  //  Consequently, I created several sets of indicators and placed them INSIDE OF THE SLIDE.
  //  This, however, means also changing the functionality of updateIndicator.
  //
  //  The original updateIndicator (from object-oriented-slider-II) looked like this:
  //
  //      updateIndicator(newIndicator, indicators){
  //        for (let i = 0; i < indicators.length; i++){
  //          let indicator = indicators[i];
  //          if (indicator.classList.contains('active')){
  //            indicator.classList.remove('active');
  //            break;
  //          }
  //        }
  //        newIndicator.classList.add('active');
  //      }
  //
  //
  //  This current updatedIndicator is hacked out such that it works with multiple
  //  sets of indicators.
  //
  //
  //////////////////////////////////////////////////////////////////////////////


  updateIndicator(newIndicator, indicators){
    for (let i = 0; i < indicators.length; i++){
      let indicator = indicators[i];
      if (indicator.classList.contains('active')){
        indicator.classList.remove('active');
      }
    }

    const newIndicatorsValue = newIndicator.dataset.slideIndicator;
    for (let i = 0; i < indicators.length; i++){
      let indicator = indicators[i];
      if (indicator.dataset.slideIndicator === newIndicatorsValue){
        indicator.classList.add('active');
      }
    }
  }


  /* ===========================================================================
                         controlSlide (& Helpers)
  =========================================================================== */


  /* ==============================
          getPreviousSlide
  ============================== */


  getPreviousSlide(){
    const self = this;

    //Return early if a slide change is already underway.
    if (self.isChanging) {
      //console.log("Hey button-masher, the slide is currently changing...");
      return;
    }


    self.isChanging    = true;
    const slides       = self.slider.getElementsByClassName('slide');
    const currentSlide = self.slider.querySelector(`[data-slide="${self.currentSlideNumber}"]`);
    let indicators;
    if (self.useIndicators){ indicators = self.slider.getElementsByClassName('indicator'); }
    let newSlideIndex;
    let newSlideNumber;


    //If there's 1 or less slides return early.
    if (slides.length <= 1){
      //console.log("Hey dopenheimer, there's not enough slides.");
      return;
    }


    //Set newSlideIndex and newSlideNumber:
    if (self.currentSlideNumber === 1) {
      newSlideIndex  = slides.length - 1;
      newSlideNumber = slides.length;
    } else {
      newSlideIndex  = self.currentSlideNumber - 2;
      newSlideNumber = self.currentSlideNumber - 1;
    }


    //Set currentSlideNumber & newSlide
    self.currentSlideNumber = newSlideNumber; //Do this immediately.
    const newSlide          = slides[newSlideIndex];


    //Update the indicator
    if (self.useIndicators){
      self.updateIndicator(indicators[newSlideIndex], indicators);
    }


    //Execute animation classes
    currentSlide.classList.add('moveToRight');
    newSlide.classList.add('moveFromLeft', 'new-slide');


    //Wait before resetting things.
    currentSlide.addEventListener('animationend', function(){
      this.classList.remove('moveToRight', 'new-slide');
    }, {once: true});


    //Wait before resetting things.
    newSlide.addEventListener('animationend', function(){
      this.classList.remove('moveFromLeft');
      self.isChanging = false;
    });
  };


  /* ==============================
          getNextSlide
  ============================== */


  getNextSlide(){
    const self = this;

    //Return early if a slide change is already underway.
    if (self.isChanging) {
      //console.log("Hey button-masher, the slide is currently changing...");
      return;
    }


    self.isChanging    = true;
    const slides       = self.slider.getElementsByClassName('slide');
    const currentSlide = self.slider.querySelector(`[data-slide="${self.currentSlideNumber}"]`);
    let indicators;
    if (self.useIndicators){ indicators = self.slider.getElementsByClassName('indicator'); }
    let newSlideIndex;
    let newSlideNumber;


    //If there's 1 or less slides return early.
    if (slides.length <= 1){
      //console.log("Hey dopenheimer, there's not enough slides.");
      return;
    }


    //Set newSlideIndex and newSlideNumber:
    if (self.currentSlideNumber === slides.length) {
      newSlideIndex  = 0;
      newSlideNumber = 1;
    } else {
      //This can be confusing because currentSlideNumber is not 0-based.
      //Thus the index of newSlide is actually the value of currentSlideNumber,
      //unless the initial condition evaluated to true;
      newSlideIndex  = self.currentSlideNumber;
      newSlideNumber = self.currentSlideNumber + 1;
    }


    //Set currentSlideNumber & newSlide
    self.currentSlideNumber = newSlideNumber; //Do this immediately.
    const newSlide          = slides[newSlideIndex];


    //Update the indicator
    if (self.useIndicators){
      self.updateIndicator(indicators[newSlideIndex], indicators);
    }


    //Execute animation classes
    currentSlide.classList.add('moveToLeft');
    newSlide.classList.add('moveFromRight', 'new-slide');


    //Wait before resetting things.
    currentSlide.addEventListener('animationend', function(){
      this.classList.remove('moveToLeft', 'new-slide');
    }, {once: true});


    //Wait before resetting things.
    newSlide.addEventListener('animationend', function(){
      this.classList.remove('moveFromRight');
      self.isChanging = false;
    });
  };


  /* ===========================================================================
                              indicateSlide
  =========================================================================== */
  //There's no need to wrap 'indicator code' in a conditional statement.
  //Becuase if there's no indicators, indicateSlide will never get invoked.


  indicateSlide(e){
    const self       = this;
    const indicators = self.slider.getElementsByClassName('indicator');


    //Return early if a slide change is already underway.
    if (self.isChanging) {
      //console.log("Hey button-masher, the slide is currently changing...");
      return;
    }


    self.isChanging           = true;
    const slideIndicatorValue = parseInt(e.target.dataset.slideIndicator, 10);
    const newSlideIndex       = slideIndicatorValue - 1;
    const currentSlide        = self.slider.querySelector(`[data-slide="${self.currentSlideNumber}"]`);
    const newSlide            = self.slider.querySelector(`[data-slide="${slideIndicatorValue}"]`);


    //Return early if the user selected the indicator for the current slide.
    if (slideIndicatorValue === self.currentSlideNumber) {
      //console.log("Hey dummy! You're already on that slide.");
      self.isChanging = false;
      return;
    }


    /* ============================

    ============================ */


    if (slideIndicatorValue > self.currentSlideNumber){
      //Update the indicator
      self.updateIndicator(indicators[newSlideIndex], indicators);


      //Set currentSlideNumber
      const newSlideNumber    = parseInt(newSlide.dataset.slide, 10);
      self.currentSlideNumber = newSlideNumber;


      //Execute animation classes
      currentSlide.classList.add('moveToLeft');
      newSlide.classList.add('moveFromRight', 'new-slide');


      //Wait before resetting things.
      currentSlide.addEventListener('animationend', function(){
        this.classList.remove('moveToLeft', 'new-slide');
      }, {once: true});


      //Wait before resetting things.
      newSlide.addEventListener('animationend', function(){
        this.classList.remove('moveFromRight');
        self.isChanging = false;
      });
    }


    /* ============================

    ============================ */


    else {
      //Update the indicator
      self.updateIndicator(indicators[newSlideIndex], indicators);


      //Set currentSlideNumber
      const newSlideNumber    = parseInt(newSlide.dataset.slide, 10);
      self.currentSlideNumber = newSlideNumber;


      //Execute animation classes
      currentSlide.classList.add('moveToRight');
      newSlide.classList.add('moveFromLeft', 'new-slide');


      //Wait before resetting things.
      currentSlide.addEventListener('animationend', function(){
        this.classList.remove('moveToRight', 'new-slide');
      }, {once: true});


      //Wait before resetting things.
      newSlide.addEventListener('animationend', function(){
        this.classList.remove('moveFromLeft');
        self.isChanging = false;
      });
    }
  }
}//End of class Slider


/* =============================================================================
                                window.onload
============================================================================= */


window.onload = function(){
  const slider1 = new Slider('slider1', { useControllers:false });
};
