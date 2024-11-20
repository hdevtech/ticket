import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { ticket_backend } from 'declarations/ticket_backend';
import { useNavigate } from 'react-router-dom';

const ViewRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  // Fetch routes and clients from the backend
  useEffect(() => {
    const fetchRoutesAndClients = async () => {
      try {
        const fetchedRoutes = await ticket_backend.getRoutes(); // Fetch routes
        const fetchedClients = await ticket_backend.getClients(); // Fetch clients
        const tickets = await ticket_backend.getAllTickets(); // Fetch ticket transactions

        // Map routes to include total seats sold and the client who booked
        const routesWithDetails = fetchedRoutes.map((route) => {
          const seatsSold = tickets.filter(
            (ticket) =>
              BigInt(ticket.route_id) === BigInt(route.route_id) &&
              ticket.payment_status === 'success'
          ).length;

          return {
            ...route,
            seats_sold: seatsSold,
          };
        });

        setRoutes(routesWithDetails);
        setClients(fetchedClients);
      } catch (error) {
        console.error('Failed to fetch routes or clients:', error);
      }
    };

    fetchRoutesAndClients();
  }, []);

  // Navigate to Add Route page
  const handleAddRoute = () => {
    navigate('/admin/add-car-route');
  };

  // Navigate to the route tickets page
  const handleViewTickets = (route_id) => {
    navigate(`/admin/route-tickets/${route_id}`);
  };

  // Handle route deletion
  const handleDeleteRoute = async (route_id) => {
    const confirmation = window.confirm('Are you sure you want to delete this route?');
    if (confirmation) {
      try {
        const deleted = await ticket_backend.deleteRoute(route_id);
        if (deleted) {
          alert('Route deleted successfully!');
          // Refresh the routes list
          const updatedRoutes = await ticket_backend.getRoutes();
          setRoutes(updatedRoutes);
        } else {
          alert('Failed to delete the route. It may not exist.');
        }
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('An error occurred while trying to delete the route.');
      }
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          {/* Add Route Button */}
          <Button variant="primary" onClick={handleAddRoute} className="mb-3">
            Add Route
          </Button>

          <Card>
            <Card.Header>
              <Card.Title as="h5">Routes</Card.Title>
              <span className="d-block m-t-5">
                List of all routes and their details.
              </span>
            </Card.Header>
            <Card.Body>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Car</th>
                    <th>Price</th>
                    <th>Seats</th>
                    <th>Seats Sold</th>
                    <th>Leave Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.length > 0 ? (
                    routes.map((route, index) => (
                      <tr key={route.route_id}>
                        <th scope="row">{index + 1}</th>
                        <td>{route.from}</td>
                        <td>{route.destination}</td>
                        <td>{route.car}</td>
                        <td>{parseFloat(route.price)} Frw</td>
                        <td>{parseInt(route.seats)}</td>
                        <td>{parseInt(route.seats_sold)}</td>
                        <td>{route.leave_date}</td>
                        <td>
                          <Button
                            variant="info"
                            onClick={() => handleViewTickets(route.route_id)}
                          >
                            View Tickets
                          </Button>
                          {route.seats_sold === 0 && (
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteRoute(route.route_id)}
                              className="ml-2"
                            >
                              Delete Route
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No routes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ViewRoutes;
