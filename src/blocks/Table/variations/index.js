import DefaultTable from './DefaultTable';
import ResponsiveTable from './ResponsiveTable';

export default [
  {
    id: 'default',
    title: 'Table (default)',
    view: DefaultTable,
    isDefault: true,
  },
  {
    id: 'testimonial',
    title: 'Responsive table',
    view: ResponsiveTable,
  },
];
