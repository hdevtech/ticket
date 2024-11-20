import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { ticket_backend } from 'declarations/ticket_backend';
import { useNavigate } from 'react-router-dom';

const ViewRoutes = () => {
  const [routes, setRoutes] = useState([]); // Store the routes instead of goals
  const [clients, setClients] = useState([]); // Store the clients (contributors)
  const navigate = useNavigate();

  // Fetch routes and clients from the backend when the component loads
  useEffect(() => {
    const fetchRoutesAndClients = async () => {
      try {
        const routeList = await ticket_backend.getRoutes(); // Fetch routes
        const clientList = await ticket_backend.getClients(); // Fetch clients

        // Map routes to include the client name, ID and remaining seats
        const routesWithClients = await Promise.all(routeList.map(async (route) => {

          const leave_date = new Date(route.leave_date);
          const now = new Date();

          // Convert both leave_date and now to seconds
          const leaveDateInSeconds = Math.floor(leave_date.getTime() / 1000);
          const nowInSeconds = Math.floor(now.getTime() / 1000);

          // Skip routes where the leave date is in the past by returning null
          if (leaveDateInSeconds < nowInSeconds) {
            return null; // Mark invalid routes with null
          }

          // Assuming the backend provides the number of tickets sold for each route
          const ticketsSold = await ticket_backend.getTicketsByRoute(route.route_id); // Fetch tickets for the route
          
          // Convert BigInt to number for proper arithmetic
          const seats = Number(route.seats); // Convert BigInt to number
          const ticketsSoldCount = ticketsSold.length; // ticketsSold is an array, so its length is a number
          
          const remainingSeats = seats - ticketsSoldCount; // Calculate remaining seats

          return {
            ...route,
            client_name: 'admin',
            client_id: 'admin',
            remaining_seats: remainingSeats
          };
        }));

        // Filter out null values from the routes list
        const validRoutes = routesWithClients.filter(route => route !== null);

        setRoutes(validRoutes); // Only set valid routes
        console.log(validRoutes);
      } catch (error) {
        console.error('Failed to fetch routes or clients:', error);
      }
    };

    fetchRoutesAndClients();
  }, []);

  // Handle route selection (this can be customized to navigate to the ticket booking page)
  const handleSelectRoute = (route_id) => {
    navigate(`/buy-ticket/${route_id}`); // Assuming you have a route to book a ticket
  };

  return (
    <React.Fragment>
      <Row>
        {routes.length > 0 ? (
          routes.map((route, index) => (
            <Col key={route.route_id} xl={4} lg={6} md={6} sm={12}>
              <Card>
                <Card.Body>
                  <h6 className="mb-4">Route</h6>
                  <p><strong>Departure:</strong> {route.from}</p>
                  <p><strong>Destination:</strong> {route.destination}</p>
                  <p><strong>Car:</strong> {route.car}</p>
                  <p><strong>Price:</strong> {parseFloat(route.price).toLocaleString()} Frw</p>
                  <p><strong>Seats Remaining:</strong> {route.remaining_seats}</p> {/* Updated to show remaining seats */}
                  <p><strong>Leave Date:</strong> {new Date(route.leave_date).toString()}</p>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <p className="m-b-0">Creator: {route.client_name}</p>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <Button variant="primary" onClick={() => handleSelectRoute(route.route_id)}>
                    Book Ticket
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-center">No routes found</p>
          </Col>
        )}
      </Row>
    </React.Fragment>
  );
};

export default ViewRoutes;
