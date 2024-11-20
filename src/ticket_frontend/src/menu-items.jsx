// menuItems.js

const originalMenuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'feather icon-home',
          url: '/admin/dashboard',
          roles: ['admin'] // admin can access
        },
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'feather icon-home',
          url: '/client/dashboard',
          roles: ['client'] //contributor can access
        }
      ]
    },
    {
      id: 'activities',
      title: 'Activities',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'add-clients-by-admin',
          title: 'Add Client',
          type: 'item',
          icon: 'feather icon-home',
          url: '/admin/AddClient',
          roles: ['admin'], // Only admin can access
        },
        {
          id: 'view-clients-by-admin',
          title: 'View Clients',
          type: 'item',
          icon: 'feather icon-home',
          url: '/admin/ViewClients',
          roles: ['admin'], // Only admin can access
        },
        {
          id: 'add-car-routes',
          title: 'Add Car Routes',
          type: 'item',
          icon: 'feather icon-home',
          url: '/admin/add-car-routes',
          roles: ['admin'], // Only admin can access
        },
        {
          id: 'view-car-routes',
          title: 'View Car Routes',
          type: 'item',
          icon: 'feather icon-home',
          url: '/admin/view-car-routes',
          roles: ['admin'], // Only admin can access
        },

        //contributor activities
        
        {
          id: 'view-car-routes',
          title: 'View Car Routes',
          type: 'item',
          icon: 'feather icon-home',
          url: '/client/view-car-routes',
          roles: ['client'], // Only admin can access
        },
        {
          id: 'view-route-tickets-mine',
          title: 'My Tickets',
          type: 'item',
          icon: 'feather icon-home',
          url: '/client/mytickets',
          roles: ['client'], // Only admin can access
        },
      ]
    },
  ]
};

// Function to filter menu items based on user role
const filterMenuItemsByRole = (userRole) => {
  return {
    ...originalMenuItems,
    items: originalMenuItems.items.map(group => ({
      ...group,
      children: group.children.filter(item => !item.roles || item.roles.includes(userRole))
    })).filter(group => group.children.length > 0) // Remove empty groups
  };
};

// Get user role from local storage
const user = JSON.parse(localStorage.getItem('user'));
const userRole = user ? user.role : null;

// Overwrite menuItems with the filtered result
const menuItems = filterMenuItemsByRole(userRole);

// Exporting as menuItems
export default menuItems;
