// Utility function for consistent scroll behavior throughout the app
export const scrollToSection = (sectionId: string, headerOffset: number = 60) => {
  const section = document.getElementById(sectionId);
  if (section) {
    const offsetTop = section.offsetTop;
    
    window.scrollTo({
      top: offsetTop - headerOffset,
      behavior: "smooth"
    });
  }
};

// Handle anchor clicks for footer and other components
export const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
  e.preventDefault();
  scrollToSection(sectionId, 60);
};