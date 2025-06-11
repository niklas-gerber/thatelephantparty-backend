# That Elephant Party - Backend API

A secure Node.js/Express backend for event management.

This fully containerized backend lets you publicly serve Static Page Content, a list of Events,
and a Ticket Purchase application that is tailored for payment through the popular
filipino e-Wallet GCash. After logging in Admins have full CRUD control over
tickets and events. A lambda function automatically closes ticketing if the deadline
is met. See details below. [Frontend publication is in the works and will follow 
around July 2025]

## Features
- **Authentication**: JWT controlled access  
- **Payments**: GCash payslip upload workflow (multer)  
- **Automation**: Lambda for ticket deadline handling  
- **Reporting**: PDF generation (attendees, accounting)  
- **Security**: Rate limiting, SQL injection protection, CSRF tokens  
- **Database**: PostgreSQL with Sequelize ORM  
- **Storage**: Local/S3 file uploads for payslips/posters  
- **Logging**: Error Handling Middleware and Winston Logger with log rotation

## Setup
1. Clone repo
2. Create `.env` (see [.env.example](.env.example))
3. `docker-compose up --build` in /backend

## Application Details
Implementation of a trust-based payment process as a workaround for GCash's API restrictions:  
- Guests upload payslips after GCash transfer  
- Automated email confirmations  
- Admin verification backend  
- Each Email address and reference number is restricted to only one ticket purchase

Control access for admin:
- Ticket prices can be adjusted dynamically (for example tiers)
- optional bundle sale (bundlesize and bundleprice)
- door service can check registered guests in and out
- Door service can count walk-in ticket sales for central accounting
- Download financial report, email list of attendees and lists of attendees' names

## API Docs
### Public Routes *(No Authentication)*
| Endpoint                     | Method | Description                           |
|------------------------------|--------|---------------------------------------|
| `/public/pages/:pagename`    | GET    | Get public static page content        |
| `/public/events`             | GET    | List all active events (public data)  |
| `/public/events/:id`         | GET    | Get single event details (public data)|
| `/public/events/:id/purchase`| POST   | Submit ticket purchase with GCash     |

### Admin Routes *(JWT Required)*
| Endpoint                              | Method | Description                        |
|---------------------------------------|--------|------------------------------------|
| `/admin/events`                       | POST   | Create new event                   |
| `/admin/events`                       | GET    | List all events (full admin data)  |
| `/admin/events/:id`                   | GET    | Get single event (full admin data) |
| `/admin/events/:id`                   | PATCH  | Update event details               |
| `/admin/events/:id`                   | DELETE | Delete event                       |
| `/admin/events/:id/attendees`         | GET    | View attendees                     |
| `/admin/events/:id/walk-ins`          | GET    | View walk-in sales counts          |
| `/admin/events/:id/walk-ins/increment`| POST   | View walk-in sales counts          |
| `/admin/events/:id/walk-ins/decrement`| POST   | View walk-in sales counts          |
| `/admin/events/:id/attendee-list`     | GET    | Download attendee list (PDF)       |
| `/admin/events/:id/accounting`        | GET    | Generate financial report (PDF)    |
| `/admin/events/:id/email-list`        | GET    | Export buyer emails (PDF)          |
| `/admin/tickets`                      | GET    | List all tickets                   |
| `/admin/tickets/:id`                  | PATCH  | Update a ticket*                   |
| `/admin/tickets/:id`                  | DELETE | Delete a ticket                    |
| `/admin/atendees/:id/check-in`        | PATCH  | Toggle Check-In status of attendee |
* Use Public Ticket Purchase for Ticket Creation.

### Authentication
| Endpoint          | Method | Description                |
|-------------------|--------|----------------------------|
| `/auth/login`     | POST   | Admin login (get JWT)      |
| `/auth/logout`    | POST   | Admin logout               |


## Tech Stack

### Core
- **Runtime**: Node.js 18 (Dockerized)
- **Framework**: Express.js
- **Database**: PostgreSQL 15 (Alpine-based container)
- **ORM**: Sequelize

### Security
- **Authentication**: JWT + CSRF tokens
- **Rate Limiting**: express-rate-limit
- **Hardening**: Helmet.js

### Features
- **Payments**: GCash workflow via Multer file uploads
- **Storage**: Local filesystem + AWS S3 integration
- **PDF Generation**: PDFKit (attendee lists, accounting)
- **Logging**: Winston with daily rotation

### Infrastructure
- **Containerization**: Docker
  - Node.js (Debian Bullseye base)
  - PostgreSQL (Alpine Linux)
- **CI/CD**: Docker Compose for local dev

### Key Dependencies
```json
{
  "@aws-sdk/client-s3": "AWS integration",
  "bcryptjs": "Password hashing",
  "nodemailer": "Email confirmations",
  "uuid": "ID generation"
}
```

## License
Contact niklas.gerber@gmail.com for help with implementation 
and before commercial use. 
That Elephant Party is always happy to share resources with 
likeminded initiatives and collectives.

© 2024 That Elephant Party. This work is licensed under 
a Creative Commons Attribution-ShareAlike 4.0 International License.