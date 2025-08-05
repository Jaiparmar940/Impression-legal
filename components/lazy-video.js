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
        >
          <source src="${this.options.webmSrc}" type="video/webm">
          <source src="${this.options.mp4Src}" type="video/mp4">
          <img src="${this.options.posterSrc}" alt="${this.options.alt}" class="w-full h-full object-cover">
        </video>
      </div>
    `;
    
    const video = this.element.querySelector('video');
    const loadingOverlay = this.element.querySelector('#loading-overlay');
    
    if (video) {
      // Remove loading overlay when video starts loading
      video.addEventListener('loadstart', () => {
        if (loadingOverlay) {
          loadingOverlay.style.opacity = '0';
          setTimeout(() => {
            if (loadingOverlay.parentNode) {
              loadingOverlay.remove();
            }
          }, 300);
        }
      });
      
      video.addEventListener('loadeddata', () => {
        this.isLoaded = true;
      });
      
      video.addEventListener('error', () => {
        this.hasError = true;
        this.renderPoster();
      });
    }
  }
}

// Mobile Swipe Carousel for Videos
class MobileVideoCarousel {
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
    // Add carousel wrapper
    this.container.innerHTML = `
      <div class="relative overflow-hidden">
        <div class="flex transition-transform duration-300 ease-out" id="carousel-slides">
          ${this.container.innerHTML}
        </div>
        <div class="flex justify-center mt-4 space-x-2" id="carousel-indicators">
          <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="0"></button>
          <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="1"></button>
          <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="2"></button>
        </div>
      </div>
    `;
    
    // Get slides and make them full width
    this.slides = this.container.querySelectorAll('#carousel-slides > div');
    this.slides.forEach(slide => {
      slide.style.minWidth = '100%';
      slide.style.flexShrink = '0';
    });
    
    // Add indicator click handlers
    const indicators = this.container.querySelectorAll('#carousel-indicators button');
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
  }
  
  setupTouchEvents() {
    const slidesContainer = this.container.querySelector('#carousel-slides');
    
    slidesContainer.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.currentX = this.startX;
    });
    
    slidesContainer.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      
      this.currentX = e.touches[0].clientX;
      const diff = this.currentX - this.startX;
      const translateX = -this.currentSlide * 100 + (diff / slidesContainer.offsetWidth) * 100;
      
      slidesContainer.style.transform = `translateX(${translateX}%)`;
    });
    
    slidesContainer.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      const diff = this.currentX - this.startX;
      const threshold = slidesContainer.offsetWidth * 0.3;
      
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
    const slidesContainer = this.container.querySelector('#carousel-slides');
    slidesContainer.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    this.updateIndicators();
  }
  
  updateIndicators() {
    const indicators = this.container.querySelectorAll('#carousel-indicators button');
    indicators.forEach((indicator, index) => {
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
  
  // Initialize mobile carousel for video section
  const videoSection = document.querySelector('#video-carousel');
  if (videoSection) {
    new MobileVideoCarousel(videoSection);
  }
}); 