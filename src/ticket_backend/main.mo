import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";

actor {

  // Stable variables for persistence
  stable var admins : [Admin] = [];
  stable var clients : [Client] = [];
  stable var routes : [Route] = [];
  stable var tickets : [Ticket] = [];

  // Define the data structures
  public type Admin = {
    admin_id: Nat;
    name: Text;
    username: Text;
    password: Text;
  };

  public type Client = {
    id: Nat;
    name: Text;
    username: Text;
    password: Text;
    phone_number: Text;
    principal: ?Principal; // Make principal optional
  };

  public type Route = {
    route_id: Nat;
    from: Text;
    destination: Text;
    car: Text;
    price: Nat;
    seats: Nat;
    leave_date: Text;
  };

  public type Ticket = {
    ticket_id: Nat;
    client_id: Nat;
    route_id: Nat;
    amount: Nat;
    date: Text;
    first_scan: Text;
    phone_number: Text; // Client's phone number
    tx_id: Text;
    tx_ref: Text;
    payment_status: Text;
  };

  // ---------------------- Admin Functions ----------------------

  public func addAdmin(admin_id: Nat, name: Text, username: Text, password: Text) : async () {
    let newAdmin : Admin = {
      admin_id;
      name;
      username;
      password;
    };
    admins := Array.append(admins, [newAdmin]);
  };

  public query func adminLogin(username: Text, password: Text) : async ?Admin {
    return Array.find<Admin>(admins, func(admin) {
      admin.username == username and admin.password == password
    });
  };

  public query func getAdmins() : async [Admin] {
    return admins;
  };
  
// get admin by  id
  public query func getAdminById(admin_id: Nat) : async ?Admin {
    return Array.find<Admin>(admins, func(a) {
      a.admin_id == admin_id
    });
  };

  // ---------------------- Client Functions ----------------------

  public func addClient(id: Nat, name: Text, username: Text, password: Text, phone_number: Text) : async () {
    let newClient : Client = {
      id;
      name;
      username;
      password;
      phone_number;
      principal = null;
    };
    clients := Array.append(clients, [newClient]);
  };
  
  // public func addContributorWithPrincipal(id: Nat, name: Text, username: Text, password: Text, phone_number: Text, principal: Principal) : async () {
  //   let newContributor : Contributor = {
  //     id;
  //     name;
  //     username;
  //     password;
  //     phone_number;
  //     principal = ?principal; // Set the principal
  //   };
  //   contributors := Array.append(contributors, [newContributor]);
  // };
  //addClientWithPrincipal 
  public func addClientWithPrincipal(id: Nat, name: Text, username: Text, password: Text, phone_number: Text, principal: Principal) : async () {
    let newClient : Client = {
      id;
      name;
      username;
      password;
      phone_number;
      principal = ?principal; // Set the principal
    };
    clients := Array.append(clients, [newClient]);
  };
  public query func clientLogin(username: Text, password: Text) : async ?Client {
    return Array.find<Client>(clients, func(client) {
      client.username == username and client.password == password
    });
  };

  public query func getClients() : async [Client] {
    return clients;
  };

  public query func getClientById(id: Nat) : async ?Client {
    return Array.find<Client>(clients, func(c) {
      c.id == id
    });
  };

  // ---------------------- Route Functions ----------------------

  public func addRoute(route_id: Nat, from: Text, destination: Text, car: Text, price: Nat, seats: Nat, leave_date: Text) : async () {
    let newRoute : Route = {
      route_id;
      from;
      destination;
      car;
      price;
      seats;
      leave_date;
    };
    routes := Array.append(routes, [newRoute]);
  };

  public query func getRoutes() : async [Route] {
    return routes;
  };

  public query func getRouteDetails(route_id: Nat) : async ?Route {
    return Array.find<Route>(routes, func(r) {
      r.route_id == route_id
    });
  };

  public func updateRoute(route_id: Nat, from: Text, destination: Text, car: Text, price: Nat, seats: Nat, leave_date: Text) : async Bool {
    let updatedRoutes = Array.filter<Route>(routes, func(route) {
      route.route_id == route_id
    });

    if (Array.size(updatedRoutes) == 0) {
      return false; // Route not found
    };

    let updatedRoute = updatedRoutes[0];
    let newRoute = {
      route_id = updatedRoute.route_id;
      from;
      destination;
      car;
      price;
      seats;
      leave_date;
    };

    // Replace the old route
    routes := Array.filter<Route>(routes, func(r) {
      r.route_id != route_id
    });
    routes := Array.append(routes, [newRoute]);
    return true;
  };

  public func deleteRoute(route_id: Nat) : async Bool {
    let updatedRoutes = Array.filter<Route>(routes, func(r) {
      r.route_id == route_id
    });

    if (Array.size(updatedRoutes) == 0) {
      return false; // Route not found
    };

    routes := Array.filter<Route>(routes, func(r) {
      r.route_id != route_id
    });
    return true;
  };

  // ---------------------- Ticket Functions ----------------------

  public func addTicket(ticket_id: Nat, client_id: Nat, route_id: Nat, amount: Nat, date: Text, first_scan: Text, phone_number: Text, tx_id: Text, tx_ref: Text, payment_status: Text) : async () {
    let newTicket : Ticket = {
      ticket_id;
      client_id;
      route_id;
      amount;
      date;
      first_scan;
      phone_number;
      tx_id;
      tx_ref;
      payment_status;
    };
    tickets := Array.append(tickets, [newTicket]);
  };

  public query func getTicketsByRoute(route_id: Nat) : async [Ticket] {
    return Array.filter<Ticket>(tickets, func(t) {
      t.route_id == route_id
    });
  };

  public query func getTicketsByClient(client_id: Nat) : async [Ticket] {
    return Array.filter<Ticket>(tickets, func(t) {
      t.client_id == client_id
    });
  };

  public query func getAllTickets() : async [Ticket] {
    return tickets;
  };
  // get ticket by id
  public query func getTicketById(ticket_id: Nat) : async ?Ticket {
    return Array.find<Ticket>(tickets, func(t) {
      t.ticket_id == ticket_id
    });
  };

  // ticket by tx ref 
  public query func getTicketByTxRef(tx_ref: Text) : async ?Ticket {
    return Array.find<Ticket>(tickets, func(t) {
      t.tx_ref == tx_ref
    });
  };

  public func updateTicketStatus(newtx_ref: Text, newtx_id: Text, new_status: Text) : async Bool {
    let updatedTickets = Array.filter<Ticket>(tickets, func(t) {
      t.tx_ref == newtx_ref
    });

    if (Array.size(updatedTickets) == 0) {
      return false; // Ticket not found
    };



    let updatedTicket = updatedTickets[0];
    let newTicket = {
      ticket_id = updatedTicket.ticket_id;
      client_id = updatedTicket.client_id;
      route_id = updatedTicket.route_id;
      amount = updatedTicket.amount;
      date = updatedTicket.date;
      first_scan = updatedTicket.first_scan;
      phone_number = updatedTicket.phone_number;
      tx_id = newtx_id;
      tx_ref = updatedTicket.tx_ref;
      payment_status = new_status;
    };

    tickets := Array.filter<Ticket>(tickets, func(t) {
      t.tx_ref != newtx_ref
    });
    tickets := Array.append(tickets, [newTicket]);
    return true;
  };


  // get 

  // Clear all data
  public func emptyData() : async () {
    admins := [];
    clients := [];
    routes := [];
    tickets := [];
  };
};
