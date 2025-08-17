export interface LogoSizeConfig {
  containerClass: string;
  imageClass: string;
  iconClass: string;
  headerHeight: string;
}

export const getLogoSizeConfig = (logoSize: string = 'medium'): LogoSizeConfig => {
  switch (logoSize) {
    case 'small':
      return {
        containerClass: 'h-6 w-6',
        imageClass: 'h-6 w-auto object-contain',
        iconClass: 'h-4 w-4',
        headerHeight: 'h-12'
      };
    case 'medium':
      return {
        containerClass: 'h-8 w-8',
        imageClass: 'h-8 w-auto object-contain',
        iconClass: 'h-5 w-5',
        headerHeight: 'h-14'
      };
    case 'large':
      return {
        containerClass: 'h-12 w-12',
        imageClass: 'h-12 w-auto object-contain',
        iconClass: 'h-8 w-8',
        headerHeight: 'h-16'
      };
    case 'xlarge':
      return {
        containerClass: 'h-16 w-16',
        imageClass: 'h-16 w-auto object-contain',
        iconClass: 'h-10 w-10',
        headerHeight: 'h-20'
      };
    default:
      return getLogoSizeConfig('medium');
  }
};

export const getSidebarLogoSizeConfig = (logoSize: string = 'medium'): LogoSizeConfig => {
  switch (logoSize) {
    case 'small':
      return {
        containerClass: 'w-8 h-8',
        imageClass: 'w-full h-full object-contain',
        iconClass: 'text-gray-600 text-sm',
        headerHeight: 'py-4'
      };
    case 'medium':
      return {
        containerClass: 'w-10 h-10',
        imageClass: 'w-full h-full object-contain',
        iconClass: 'text-gray-600 text-lg',
        headerHeight: 'py-6'
      };
    case 'large':
      return {
        containerClass: 'w-12 h-12',
        imageClass: 'w-full h-full object-contain',
        iconClass: 'text-gray-600 text-xl',
        headerHeight: 'py-8'
      };
    case 'xlarge':
      return {
        containerClass: 'w-16 h-16',
        imageClass: 'w-full h-full object-contain',
        iconClass: 'text-gray-600 text-2xl',
        headerHeight: 'py-10'
      };
    default:
      return getSidebarLogoSizeConfig('medium');
  }
};