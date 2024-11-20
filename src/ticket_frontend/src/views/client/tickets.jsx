import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Spinner, Button, Modal } from 'react-bootstrap';
import { ticket_backend } from 'declarations/ticket_backend';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQRCodeModal, setShowQRCodeModal] = useState(false); // To control QR code modal visibility
  const [qrCodeData, setQrCodeData] = useState({}); // To store the QR code data and details

  useEffect(() => {
    const fetchTicketsAndRoutes = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const my_user = JSON.parse(storedUser);

        if (!my_user) {
          setErrorMessage('No logged-in user found. Please log in.');
          setLoading(false);
          return;
        }

        // Fetch tickets for the logged-in client
        const ticketsList = await ticket_backend.getTicketsByClient(Number(my_user.id));
        setTickets(ticketsList);

        // Fetch all routes
        const routesList = await ticket_backend.getRoutes();
        setRoutes(routesList);

        // Fetch all clients to get user information
        const clientsList = await ticket_backend.getClients();
        setClients(clientsList);
      } catch (error) {
        console.error('Failed to fetch tickets, routes, or clients:', error);
        setErrorMessage('Could not fetch tickets, routes, or clients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketsAndRoutes();
  }, []);

  const generateTicketQRCodeUrl = (ticket) => {
    // Find the route details for this ticket based on the route_id
    const route = routes.find(route => route.route_id === ticket.route_id);
    if (!route) {
      return null;  // Return null if no route found
    }

    // Find the client details for this ticket based on the client_id
    const client = clients.find(client => client.id === ticket.client_id);
    if (!client) {
      return null;  // Return null if no client found
    }

    // Prepare a more readable format for QR code data
    const ticketInfo = `
      Ticket ID: ${ticket.ticket_id}
      Client: ${client.name} (${client.username})
      Route: ${route.from} → ${route.destination}
      Leave Date: ${new Date(route.leave_date).toString()}
      Amount: ${ticket.amount} Frw
      Date: ${new Date(ticket.date).toString()}
      Payment Status: ${ticket.payment_status}
      Transaction ID: ${ticket.tx_id}
    `;

    // Use the QRServer API to generate the QR code image URL
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(ticketInfo)}&size=200x200`;

    return { 
      qrCodeUrl: qrCodeApiUrl, 
      clientName: client.name, 
      route: `${route.from} → ${route.destination}`, 
      leaveDate: new Date(route.leave_date).toString(),
      price: `${Number(ticket.amount).toLocaleString()} Frw` 
    };  // Return QR code details and URL
  };

  const handleViewQRCode = (ticket) => {
    const qrCodeDetails = generateTicketQRCodeUrl(ticket);
    if (qrCodeDetails) {
      setQrCodeData(qrCodeDetails); // Set the QR code data and details
      setShowQRCodeModal(true); // Show the modal
    }
  };

  const handleCloseModal = () => setShowQRCodeModal(false); // Close the modal

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
            <Card.Title as="h5">My Tickets</Card.Title>
          </Card.Header>
          <Card.Body>
            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client Name</th>
                  <th>Client Phone</th>
                  <th>Username</th>
                  <th>Route</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Status</th>
                  <th>Transaction ID</th>
                  <th>QR Code</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map((ticket, index) => {
                    // Find the route and client for each ticket
                    const route = routes.find(route => route.route_id === ticket.route_id);
                    const client = clients.find(client => client.id === ticket.client_id);

                    return (
                      <tr key={ticket.ticket_id}>
                        <th scope="row">{index + 1}</th>
                        <td>{client ? client.name : 'N/A'}</td>
                        <td>{client ? client.phone_number : 'N/A'}</td>
                        <td>{client ? client.username : 'N/A'}</td>
                        <td>{route ? `${route.from} → ${route.destination}` : 'N/A'}</td>
                        <td>{Number(ticket.amount).toLocaleString()} Frw</td>
                        <td>{new Date(ticket.date).toString()}</td>
                        <td>{ticket.payment_status}</td>
                        <td>{ticket.tx_id}</td>
                        <td>
                          <Button variant="info" onClick={() => handleViewQRCode(ticket)}>View QR Code</Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal for displaying the QR code */}
      <Modal show={showQRCodeModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Ticket QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrCodeData.qrCodeUrl ? (
            <>
              <img src={qrCodeData.qrCodeUrl} alt="Ticket QR Code" />
              <div className="mt-3">
                <p><strong>Route:</strong> {qrCodeData.route}</p>
                <p><strong>Leave Date:</strong> {qrCodeData.leaveDate}</p>
                <p><strong>Price:</strong> {qrCodeData.price}</p>
                <p><strong>Client:</strong> {qrCodeData.clientName}</p>
              </div>
            </>
          ) : (
            <p>Loading QR code...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyTickets;
