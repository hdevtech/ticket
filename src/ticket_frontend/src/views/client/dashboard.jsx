import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Spinner, Button } from 'react-bootstrap';
import { ticket_backend } from 'declarations/ticket_backend';
import { Link } from 'react-router-dom'; // Import Link for navigation

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [clientInfo, setClientInfo] = useState(null); // State to hold client info
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchTicketsWithRoutes = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const my_user = JSON.parse(storedUser);

        if (!my_user) {
          setErrorMessage('No logged-in user found. Please log in.');
          setLoading(false);
          return;
        }

        // Fetch client info for the logged-in user
        const clientData = await ticket_backend.getClientById(Number(my_user.id));
        if (clientData) {
          setClientInfo(clientData[0]); // Set the client information
        }

        // Fetch tickets for the logged-in client
        const ticketsList = await ticket_backend.getTicketsByClient(Number(my_user.id));

        // Fetch the route details for each ticket
        const ticketsWithRoutes = await Promise.all(
          ticketsList.map(async (ticket) => {
            const routeDetails = await ticket_backend.getRouteDetails(Number(ticket.route_id));
            return {
              ...ticket,
              route_details: routeDetails ? `${routeDetails[0].from} to ${routeDetails[0].destination}` : 'Unknown Route', // Fallback in case route is not found
            };
          })
        );

        setTickets(ticketsWithRoutes);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        setErrorMessage('Could not fetch tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketsWithRoutes();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : errorMessage ? (
        <Alert variant="danger" className="text-center">{errorMessage}</Alert>
      ) : (
        <div>
          {clientInfo && (
            <Card className="mb-4">
              <Card.Header>
                <Card.Title as="h5">Logged in Client Info</Card.Title>
              </Card.Header>
              <Card.Body>
                <p><strong>Name:</strong> {clientInfo.name}</p>
                <p><strong>Username:</strong> {clientInfo.username}</p>
                <p><strong>Phone Number:</strong> {clientInfo.phone_number}</p>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header>
              <Card.Title as="h5">Recent Tickets</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Route</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length > 0 ? (
                    tickets
                      .slice(-3) // Get the last 3 tickets
                      .map((ticket, index) => (
                        <tr key={ticket.ticket_id}>
                          <th scope="row">{index + 1}</th>
                          <td>{ticket.route_details}</td> {/* Displaying route details */}
                          <td>{Number(ticket.amount).toLocaleString()} Frw</td>
                          <td>{new Date(ticket.date).toLocaleDateString()}</td>
                          <td>{ticket.payment_status}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* "View More" Button */}
              <div className="text-center">
                <Link to="/client/mytickets">
                  <Button variant="primary">View More</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
