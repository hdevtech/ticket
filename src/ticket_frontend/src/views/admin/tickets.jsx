import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Alert, Spinner, Button, Modal } from 'react-bootstrap';
import { ticket_backend } from 'declarations/ticket_backend';

const AdminTicketsByRoute = () => {
  const { route_id } = useParams();
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQRCodeUrl] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchTicketsClientsAndRoute = async () => {
      try {
        const routeDetails = await ticket_backend.getRouteDetails(Number(route_id));
        if (!routeDetails) {
          setErrorMessage('Route not found.');
          setLoading(false);
          return;
        }
        setRoute(routeDetails[0]);

        const ticketsList = await ticket_backend.getTicketsByRoute(Number(route_id));
        setTickets(ticketsList);

        const clientsList = await ticket_backend.getClients();
        setClients(clientsList);
      } catch (error) {
        console.error('Failed to fetch tickets, clients, or route:', error);
        setErrorMessage('Could not fetch tickets, clients, or route. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketsClientsAndRoute();
  }, [route_id]);

  const generateQRCode = async (ticket) => {
    // Create a newline-separated string for the QR code, including route name and leave date
    const qrCodeData = `Ticket ID: ${ticket.ticket_id}\nClient ID: ${ticket.client_id}\nRoute ID: ${ticket.route_id}\nRoute: ${route ? route.from + " to " + route.destination : 'N/A'}\nLeave Date: ${route ? new Date(route.leave_date).toLocaleString() : 'N/A'}\nAmount: ${ticket.amount}\nPayment Status: ${ticket.payment_status}`;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrCodeData
    )}&size=200x200`;

    try {
      return apiUrl; // Return the QR code image URL
    } catch (error) {
      console.error('Error generating QR Code:', error);
      return null;
    }
  };

  const handleShowQRCode = async (ticket) => {
    setSelectedTicket(ticket);
    const qrCodeImageUrl = await generateQRCode(ticket);
    setQRCodeUrl(qrCodeImageUrl);
    setShowQRCode(true);
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
    setSelectedTicket(null);
    setQRCodeUrl(null);
  };

  return (
    <div>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : errorMessage ? (
        <Alert variant="danger" className="text-center">{errorMessage}</Alert>
      ) : (
        <Card>
          <Card.Header>
            <Card.Title as="h5">Tickets for Route ID: {route_id}</Card.Title>
          </Card.Header>
          <Card.Body>
            {route && (
              <div className="mb-4">
                <h6>Route Information</h6>
                <ul>
                  <li><strong>From:</strong> {route.from}</li>
                  <li><strong>Destination:</strong> {route.destination}</li>
                  <li><strong>Car:</strong> {route.car}</li>
                  <li><strong>Price:</strong> {Number(route.price).toLocaleString()} Frw</li>
                  <li><strong>Seats Available:</strong> {route.seats}</li>
                  <li><strong>Departure Date:</strong> {new Date(route.leave_date).toString()}</li>
                </ul>
              </div>
            )}

            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client Name</th>
                  <th>Client Phone</th>
                  <th>Username</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map((ticket, index) => {
                    const client = clients.find(client => client.id === ticket.client_id);

                    return (
                      <tr key={ticket.ticket_id}>
                        <th scope="row">{index + 1}</th>
                        <td>{client ? client.name : 'N/A'}</td>
                        <td>{client ? client.phone_number : 'N/A'}</td>
                        <td>{client ? client.username : 'N/A'}</td>
                        <td>{Number(ticket.amount).toLocaleString()} Frw</td>
                        <td>{new Date(ticket.date).toString()}</td>
                        <td>{ticket.payment_status}</td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleShowQRCode(ticket)}
                          >
                            View QR Code
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No tickets found for this route.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={showQRCode} onHide={handleCloseQRCode} centered>
        <Modal.Header closeButton>
          <Modal.Title>QR Code for Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrCodeUrl ? (
            <>
              <img src={qrCodeUrl} alt="QR Code" />
              <div className="mt-3">
                <p><strong>Client ID:</strong> {parseInt(selectedTicket.client_id)}</p>
                <p><strong>Amount:</strong> {Number(selectedTicket.amount).toLocaleString()} Frw</p>
                <p><strong>Payment Status:</strong> {selectedTicket.payment_status}</p>
              </div>
            </>
          ) : (
            <Spinner animation="border" variant="primary" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseQRCode}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminTicketsByRoute;
