// Simple Video Carousel - Mobile Only
class SimpleVideoCarousel {
  constructor(container) {
    this.container = container;
    this.currentSlide = 0;
    this.slides = [];
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.isMobile = this.checkMobile();
    
    // Video data in correct order: demo2, demo3, demo1
    this.videoData = [
      { 
        id: 'demo2', 
        mp4: 'assets/animations/videos/demo2.mp4', 
        webm: 'assets/animations/videos/demo2.webm', 
        poster: 'assets/animations/posters/demo2-poster.jpg',
        title: 'Easy Profile Upload',
        description: 'Upload your photos and prompts in seconds'
      },
      { 
        id: 'demo3', 
        mp4: 'assets/animations/videos/demo3.mp4', 
        webm: 'assets/animations/videos/demo3.webm', 
        poster: 'assets/animations/posters/demo3-poster.jpg',
        title: 'Smart Review System',
        description: 'Rate profiles with detailed feedback'
      },
      { 
        id: 'demo1', 
        mp4: 'assets/animations/videos/demo1.mp4', 
        webm: 'assets/animations/videos/demo1.webm', 
        poster: 'assets/animations/posters/demo1-poster.jpg',
        title: 'Detailed Results',
        description: 'Get comprehensive feedback and AI suggestions'
      }
    ];
    
    this.init();
  }
  
  checkMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  }
  
  init() {
    if (this.isMobile) {
      this.setupMobileCarousel();
      this.setupTouchEvents();
      this.updateIndicators();
      this.loadCurrentSlide();
    } else {
      this.setupDesktopLayout();
    }
  }
  
  setupDesktopLayout() {
    // Get all video containers
    const videoContainers = this.container.querySelectorAll('[data-lazy-video]');
    
    // Load all videos for desktop
    videoContainers.forEach((container, index) => {
      this.loadVideo(container, this.videoData[index]);
    });
  }
  
  setupMobileCarousel() {
    // Get the video cards
    this.slides = Array.from(this.container.querySelectorAll('div[class*="bg-white"]'));
    
    // Create indicators
    const indicators = document.createElement('div');
    indicators.className = 'flex justify-center mt-4 space-x-2';
    indicators.innerHTML = `
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="0"></button>
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="1"></button>
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="2"></button>
    `;
    
    this.container.parentNode.insertBefore(indicators, this.container.nextSibling);
    
    // Setup container for mobile
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'relative';
    
    // Setup slides for mobile
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
    if (!this.isMobile) return;
    
    this.container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.currentX = this.startX;
    });
    
    this.container.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
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
    
    this.container.addEventListener('touchend', (e) => {
      if (!this.isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
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
    if (!this.isMobile) return;
    
    // Pause current slide video
    this.pauseCurrentSlide();
    
    this.currentSlide = Math.max(0, Math.min(index, this.slides.length - 1));
    
    // Hide all slides
    this.slides.forEach(slide => {
      slide.style.display = 'none';
      slide.style.transform = '';
    });
    
    // Show current slide
    this.slides[this.currentSlide].style.display = 'block';
    
    this.updateIndicators();
    this.loadCurrentSlide();
  }
  
  pauseCurrentSlide() {
    if (!this.isMobile) return;
    
    const currentSlide = this.slides[this.currentSlide];
    const video = currentSlide.querySelector('video');
    if (video) {
      video.pause();
    }
  }
  
  loadCurrentSlide() {
    if (!this.isMobile) return;
    
    const currentSlide = this.slides[this.currentSlide];
    const videoContainer = currentSlide.querySelector('[data-lazy-video]');
    
    if (!videoContainer) return;
    
    const videoData = this.videoData[this.currentSlide];
    this.loadVideo(videoContainer, videoData);
  }
  
  loadVideo(container, videoData) {
    // Create video element
    const video = document.createElement('video');
    video.className = 'w-full h-full object-cover';
    
    // Essential attributes for autoplay and no controls
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.poster = videoData.poster;
    
    // iOS-specific attributes
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
    video.setAttribute('x5-video-player-type', 'h5');
    video.setAttribute('x5-video-player-fullscreen', 'false');
    video.setAttribute('x-webkit-airplay', 'allow');
    video.setAttribute('x5-video-orientation', 'portraint');
    video.setAttribute('x5-video-ignore-metadata', 'true');
    video.setAttribute('disablePictureInPicture', 'true');
    video.setAttribute('disableRemotePlayback', 'true');
    
    // Add sources
    const webmSource = document.createElement('source');
    webmSource.src = videoData.webm;
    webmSource.type = 'video/webm';
    video.appendChild(webmSource);
    
    const mp4Source = document.createElement('source');
    mp4Source.src = videoData.mp4;
    mp4Source.type = 'video/mp4';
    video.appendChild(mp4Source);
    
    // Add fallback image
    const fallbackImg = document.createElement('img');
    fallbackImg.src = videoData.poster;
    fallbackImg.alt = 'Video poster';
    fallbackImg.className = 'w-full h-full object-cover';
    video.appendChild(fallbackImg);
    
    // Clear container and add video
    container.innerHTML = '';
    container.appendChild(video);
    
    // Setup video events
    this.setupVideoEvents(video);
    
    // Load and play video
    video.load();
    this.attemptPlay(video);
  }
  
  setupVideoEvents(video) {
    // Basic video events
    video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });
    
    video.addEventListener('canplay', () => {
      this.attemptPlay(video);
    });
    
    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
    });
    
    // Prevent all interactions that might show controls
    const preventEvents = [
      'webkitbeginfullscreen',
      'webkitendfullscreen', 
      'webkitfullscreenchange',
      'contextmenu',
      'touchstart',
      'touchend',
      'touchmove',
      'click',
      'dblclick',
      'mousedown',
      'mouseup',
      'mousemove'
    ];
    
    preventEvents.forEach(eventType => {
      video.addEventListener(eventType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    });
  }
  
  attemptPlay(video) {
    // Don't attempt to play if video is already playing
    if (!video.paused) {
      return;
    }
    
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Video playing successfully');
        })
        .catch(error => {
          console.log('Autoplay failed:', error.message);
          if (this.isMobile) {
            this.addPlayButton(video);
          }
        });
    }
  }
  
  addPlayButton(video) {
    const container = video.parentElement;
    if (container.querySelector('.mobile-play-button')) return;
    
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
      video.play().then(() => {
        playButton.remove();
      }).catch(e => {
        console.log('Manual play failed:', e);
      });
    });
    
    container.appendChild(playButton);
  }
  
  updateIndicators() {
    if (!this.isMobile) return;
    
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

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const videoSection = document.querySelector('#video-carousel');
  if (videoSection) {
    new SimpleVideoCarousel(videoSection);
  }
}); 