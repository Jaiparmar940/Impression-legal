class LazyVideo {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      mp4Src: '',
      webmSrc: '',
      posterSrc: '',
      alt: '',
      autoplay: true,
      loop: true,
      muted: true,
      playsInline: true,
      ...options
    };
    
    this.isLoaded = false;
    this.isInView = false;
    this.hasError = false;
    this.videoElement = null;
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.renderPoster();
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.isInView = true;
            this.loadVideo();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
    
    observer.observe(this.element);
  }
  
  renderPoster() {
    this.element.innerHTML = `
      <div class="w-full h-full relative">
        <img 
          src="${this.options.posterSrc}" 
          alt="${this.options.alt}" 
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    `;
  }
  
  loadVideo() {
    // Create loading placeholder and video
    this.element.innerHTML = `
      <div class="w-full h-full relative">
        <div id="loading-overlay" class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div class="text-gray-400 text-sm">Loading...</div>
        </div>
        <video 
          class="w-full h-full object-cover"
          poster="${this.options.posterSrc}"
          autoplay="${this.options.autoplay}"
          loop="${this.options.loop}"
          muted="${this.options.muted}"
          playsinline="${this.options.playsInline}"
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          preload="metadata"
          controls="false"
        >
          <source src="${this.options.webmSrc}" type="video/webm">
          <source src="${this.options.mp4Src}" type="video/mp4">
          <img src="${this.options.posterSrc}" alt="${this.options.alt}" class="w-full h-full object-cover">
        </video>
      </div>
    `;
    
    this.videoElement = this.element.querySelector('video');
    const loadingOverlay = this.element.querySelector('#loading-overlay');
    
    if (this.videoElement) {
      this.setupVideoEvents(loadingOverlay);
    }
  }
  
  setupVideoEvents(loadingOverlay) {
    // Remove loading overlay when video starts loading
    this.videoElement.addEventListener('loadstart', () => {
      if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
          if (loadingOverlay.parentNode) {
            loadingOverlay.remove();
          }
        }, 300);
      }
    });
    
    this.videoElement.addEventListener('loadeddata', () => {
      this.isLoaded = true;
      this.attemptMobilePlay();
    });
    
    this.videoElement.addEventListener('canplay', () => {
      this.attemptMobilePlay();
    });
    
    this.videoElement.addEventListener('error', (e) => {
      console.error('Video error:', e);
      this.hasError = true;
      this.renderPoster();
    });
    
    // Multiple mobile play attempts
    this.setupMobilePlayHandlers();
  }
  
  setupMobilePlayHandlers() {
    if (!this.isMobile()) return;
    
    // Touch to play
    this.videoElement.addEventListener('touchstart', () => {
      this.attemptMobilePlay();
    });
    
    // Click to play
    this.videoElement.addEventListener('click', () => {
      this.attemptMobilePlay();
    });
    
    // Visibility change play
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isInView) {
        setTimeout(() => this.attemptMobilePlay(), 100);
      }
    });
    
    // User interaction detection
    let hasUserInteracted = false;
    const userInteractionEvents = ['touchstart', 'mousedown', 'keydown', 'scroll'];
    
    userInteractionEvents.forEach(event => {
      document.addEventListener(event, () => {
        hasUserInteracted = true;
        if (this.isInView && this.isLoaded) {
          setTimeout(() => this.attemptMobilePlay(), 100);
        }
      }, { once: true });
    });
  }
  
  attemptMobilePlay() {
    if (!this.videoElement || !this.isMobile()) return;
    
    const playPromise = this.videoElement.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Mobile video playing successfully');
        })
        .catch(error => {
          console.log('Mobile autoplay failed:', error.message);
          // Add play button overlay for mobile
          this.addPlayButton();
        });
    }
  }
  
  addPlayButton() {
    if (this.element.querySelector('.mobile-play-button')) return;
    
    const playButton = document.createElement('div');
    playButton.className = 'mobile-play-button absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer z-20';
    playButton.innerHTML = `
      <div class="bg-white rounded-full p-3">
        <svg class="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
        </svg>
      </div>
    `;
    
    playButton.addEventListener('click', () => {
      this.videoElement.play().then(() => {
        playButton.remove();
      }).catch(e => {
        console.log('Manual play failed:', e);
      });
    });
    
    this.element.appendChild(playButton);
  }
  
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  }
}

// Simple Mobile Carousel - No wrapping, just CSS transforms
class SimpleMobileCarousel {
  constructor(container) {
    this.container = container;
    this.currentSlide = 0;
    this.slides = [];
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    
    this.init();
  }
  
  init() {
    // Only initialize on mobile devices
    if (window.innerWidth >= 768) return;
    
    this.setupCarousel();
    this.setupTouchEvents();
    this.updateIndicators();
  }
  
  setupCarousel() {
    // Get the video cards
    this.slides = this.container.querySelectorAll('div[class*="bg-white"]');
    
    // Add indicators after the container
    const indicators = document.createElement('div');
    indicators.className = 'flex justify-center mt-4 space-x-2';
    indicators.innerHTML = `
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="0"></button>
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="1"></button>
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="2"></button>
    `;
    
    this.container.parentNode.insertBefore(indicators, this.container.nextSibling);
    
    // Make container overflow hidden
    this.container.style.overflow = 'hidden';
    
    // Make slides full width and hide non-active ones
    this.slides.forEach((slide, index) => {
      slide.style.minWidth = '100%';
      slide.style.width = '100%';
      slide.style.flexShrink = '0';
      slide.style.flexGrow = '0';
      
      if (index !== 0) {
        slide.style.display = 'none';
      }
    });
    
    // Add indicator click handlers
    const indicatorButtons = indicators.querySelectorAll('button');
    indicatorButtons.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
  }
  
  setupTouchEvents() {
    this.container.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.currentX = this.startX;
    });
    
    this.container.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      
      this.currentX = e.touches[0].clientX;
      const diff = this.currentX - this.startX;
      
      // Visual feedback during drag
      if (Math.abs(diff) > 10) {
        const currentSlide = this.slides[this.currentSlide];
        const nextSlide = this.slides[this.currentSlide + 1];
        const prevSlide = this.slides[this.currentSlide - 1];
        
        if (diff > 0 && prevSlide) {
          prevSlide.style.display = 'block';
          prevSlide.style.transform = `translateX(${diff}px)`;
        } else if (diff < 0 && nextSlide) {
          nextSlide.style.display = 'block';
          nextSlide.style.transform = `translateX(${diff}px)`;
        }
      }
    });
    
    this.container.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      const diff = this.currentX - this.startX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && this.currentSlide > 0) {
          this.goToSlide(this.currentSlide - 1);
        } else if (diff < 0 && this.currentSlide < this.slides.length - 1) {
          this.goToSlide(this.currentSlide + 1);
        } else {
          this.goToSlide(this.currentSlide);
        }
      } else {
        this.goToSlide(this.currentSlide);
      }
    });
  }
  
  goToSlide(index) {
    this.currentSlide = Math.max(0, Math.min(index, this.slides.length - 1));
    
    // Hide all slides
    this.slides.forEach(slide => {
      slide.style.display = 'none';
      slide.style.transform = '';
    });
    
    // Show current slide
    this.slides[this.currentSlide].style.display = 'block';
    
    this.updateIndicators();
    
    // Try to play video in current slide
    setTimeout(() => {
      const currentSlide = this.slides[this.currentSlide];
      const video = currentSlide.querySelector('video');
      if (video && video.readyState >= 2) {
        video.play().catch(e => {
          console.log('Auto-play failed on slide change');
        });
      }
    }, 300);
  }
  
  updateIndicators() {
    const indicators = this.container.parentNode.querySelector('.flex.justify-center');
    if (!indicators) return;
    
    const indicatorButtons = indicators.querySelectorAll('button');
    indicatorButtons.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.remove('bg-gray-300');
        indicator.classList.add('bg-indigo-600');
      } else {
        indicator.classList.remove('bg-indigo-600');
        indicator.classList.add('bg-gray-300');
      }
    });
  }
}

// Auto-initialize lazy videos when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const lazyVideoElements = document.querySelectorAll('[data-lazy-video]');
  
  lazyVideoElements.forEach(element => {
    const mp4Src = element.getAttribute('data-mp4-src');
    const webmSrc = element.getAttribute('data-webm-src');
    const posterSrc = element.getAttribute('data-poster-src');
    const alt = element.getAttribute('data-alt');
    const autoplay = element.getAttribute('data-autoplay') !== 'false';
    const loop = element.getAttribute('data-loop') !== 'false';
    const muted = element.getAttribute('data-muted') !== 'false';
    const playsInline = element.getAttribute('data-plays-inline') !== 'false';
    
    new LazyVideo(element, {
      mp4Src,
      webmSrc,
      posterSrc,
      alt,
      autoplay,
      loop,
      muted,
      playsInline
    });
  });
  
  // Initialize simple mobile carousel after videos are initialized
  setTimeout(() => {
    const videoSection = document.querySelector('#video-carousel');
    if (videoSection) {
      new SimpleMobileCarousel(videoSection);
    }
  }, 200);
}); 