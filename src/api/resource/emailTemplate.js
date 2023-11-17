exports.forgetPasswordEmail = (link) => {
  return `
    Hello,
    
    We received a request to reset your password for your PetHub account. To reset your password, please click on the link below. This link will expire in 15 minutes for security reasons:
      
    Reset Password Link: ${link}
      
    If you did not request this password reset, please ignore this email, and your password will remain unchanged. 
    
    For security reasons, please do not share this link with anyone. 

    Thank you for using PetHub!
      
    Regards,
    Pethub
    `;
};

exports.petBusinessApplicationApprovalEmail = (name, link) => {
  return `
    Dear ${name},
    
    Your application to be a Pet Business Partner has been approved. 
      
    You are now eligible to access additional features in the platform, please log in at: ${link}.

    Thank you for using PetHub!
      
    Regards,
    The PetHub Team
    `;
};

exports.petBusinessApplicationRejectionEmail = (name, link, remark) => {
  return `
      Dear ${name},
      
      Your application to be a Pet Business Partner has been rejected.

      The reason for rejection is: ${remark}
        
      Please log in and edit your application details at: ${link}.
  
      Thank you for using PetHub!
        
      Regards,
      The PetHub Team
      `;
};

exports.rescheduleOrRefundBookingEmail = (name, link, booking) => {
  return `
      Dear ${name},
      
      Your appointment has been affected by changes in schedule. 

      Booking Details:
      Booking ID: ${booking.bookingId}
      Service: ${booking.serviceListing.title}
      Date and Time: ${booking.startTime.toLocaleString()} - ${booking.endTime.toLocaleString()}
        
      Please reschedule your booking or request for refund: ${link}.
  
      Thank you for using PetHub!
        
      Regards,
      The PetHub Team
      `;
};

exports.refundBookingEmail = (name, booking) => {
  return `
    Dear ${name},
    
    Your appointment has been affected by changes in schedule. 
    
    The following Booking would be refunded:

    Booking Details:
    Booking ID: ${booking.bookingId}
    Service: ${booking.serviceListing.title}
    Date and Time: ${booking.startTime.toLocaleString()} - ${booking.endTime.toLocaleString()}
      
    Please note that the refund for this booking will take approximately 5 working days to be processed.
    
    Thank you for using PetHub!
      
    Regards,
    The PetHub Team
    `;
};

exports.deleteServiceListingEmail = (name, postTitle) => {
  return `
    Dear ${name},
    
    We hope this message finds you well. We would like to inform you about an important update regarding your posted service listing on PetHub.

    After a review of our platform's content and policies, it has come to our attention that your post titled "${postTitle}" has been removed from PetHub.
    
    We understand that this may come as a surprise, and we apologize for any inconvenience this may cause. Our aim is to maintain a safe and welcoming environment for all users, and in doing so, we occasionally need to remove content that does not meet our standards.
    
    If you have any questions or would like further clarification about the removal of your post, please do not hesitate to reach out to our support team. We are here to assist you with any concerns you may have.
        
    Best regards,
      
    Regards,
    The PetHub Team
    `;
};

exports.checkoutSuccessEmail = (name, invoice, link) => {
  let pointsRedeemedSection =
    invoice.pointsRedeemed !== 0
      ? `
    Points Redeemed: ${invoice.pointsRedeemed}
    Misc Charge (after points redemption) (7%): $${invoice.finalMiscCharge}
    `
      : "";

  return `
    Dear ${name},

    Thank you for your purchase at PetHub!

    We are pleased to inform you that your order has been successfully processed.

    Order Summary:
    - Invoice ID: ${invoice.invoiceId}
    - Payment ID: ${invoice.paymentId}

    Billing Details:
    - Subtotal: $${invoice.totalPrice}
    - Misc Charge (before points redemption) (7%): $${invoice.miscCharge}
    ${pointsRedeemedSection}
    - Total Amount: $${invoice.finalTotalPrice}

    You can view your order details and track the delivery status by clicking the following link: ${link}

    We appreciate your business and look forward to serving you again.

    Warm regards,
    The PetHub Team
`;
};

exports.POVoucherFulfillmentEmail = (orderItem) => {
  return `
    Dear ${orderItem.invoice.PetOwner.firstName},

    🐾 Exciting News for You and Your Furry Friend! 🐾 We're wagging our tails with delight to let you know that your order with ${orderItem.serviceListing.petBusiness.companyName} has been successfully fulfilled!

    Order Details:
    - Order Item ID: ${orderItem.orderItemId}
    - Service Listing: ${orderItem.serviceListing.title}

    If you have any questions or need further assistance, please don't hesitate to contact the service provider at ${orderItem.serviceListing.petBusiness.businessEmail}. Otherwise, you can always file a support ticket on PetHub - we're as pet-passionate as you are!

    Thank you for choosing our platform. Your support means the world to us, and we can't wait to serve you and your furry companion(s) again in the future. 🐶🐱
    
    Paw-sitively,
    The PetHub Team
  `;
};

exports.PBVoucherFulfillmentEmail = (orderItem) => {
  const floatPrice = parseFloat(orderItem.itemPrice).toFixed(2);
  return `
    Dear ${orderItem.serviceListing.petBusiness.companyName},

    Congratulations, a customer has successfully fulfilled an order for your service!

    Order Details:
    - Customer ID: ${orderItem.invoice.petOwnerUserId}
    - Order Item ID: ${orderItem.orderItemId}
    - Service Listing: ${orderItem.serviceListing.title}
    - Amount: $${floatPrice}
    
    The amount, after platform and payment fees, will be credited to your Stripe business account at the end of this month, if it fulfills the payout criteria. You can learn more about our payout cycle and criterias at under the Frequently Asked Questions (FAQ) section of the PetHub Business Website home page.
    
    If you have any questions or need further assistance, please don't hesitate to file a support ticket on PetHub.

    Regards,
    The PetHub Team
  `;
};

exports.bookingRescheduleEmail = (name, booking, serviceListingTitle, link) => {
  return `
      Dear ${name},
      
      Your appointment has been successfully rescheduled. If this action was not performed by you, this means that the service provider has rescheduled your appointment on your behalf. If this is not intended, please contact PetHub support. 

      New Booking Details:
      Booking ID: ${booking.bookingId}
      Service: ${serviceListingTitle}
      Date and Time: ${booking.startTime.toLocaleString()} - ${booking.endTime.toLocaleString()}
        
      Proceed to this link to view your outstanding appointments: ${link}.
  
      Thank you for using PetHub!
        
      Regards,
      The PetHub Team
      `;
};

exports.AccountEmailVerificationEmail = (name, link) => {
  return `
    Dear ${name},

    Thanks for getting started with PetHub! We need a little more information to complete your registration, including confirmation of your email address. Click below to confirm your email address: ${link}

    If you have problems, please paste the above URL into your web browser.

    Regards,
    The PetHub Team  
  `;
};

exports.ConfirmationEmailVerificationEmail = (name) => {
  return `
    Dear ${name},

    Congratulations! Your email address has been successfully verified, and your PetHub account is now activated. You are now ready to enjoy all the features and benefits of PetHub.

    If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!

    Thank you for choosing PetHub.

    Regards,
    The PetHub Team
  `;
};

exports.CreateNewInternalUser = (name, email, password) => {
  return `
    Dear ${name},

    We are excited to inform you that your PetHub account has been created. Here are your account details:
    
    Email: ${email}
    Temporary Password: ${password}
    
    For security reasons, we recommend that you change your password immediately. To do this, follow these steps:
    
    1. Visit the PetHub login page: [PetHub Login](http://localhost:3001/login)
    2. Use your email and the temporary password provided above to log in.
    3. Once logged in, go to your account settings and change your password to something secure and memorable.
    
    If you have any questions or need assistance, please don't hesitate to contact our support team.
    
    Thank you for choosing PetHub.
    
    Regards,
    The PetHub Team
  `;
};

exports.payoutPBEmail = (name) => {
  return `Dear ${name},

  We hope this message finds you well.
  
  We are pleased to inform you that the monthly payout for your services has been successfully processed. Your hard work and dedication to providing top-notch services to our users are greatly appreciated.
  
  To view the detailed payout statement and invoice for this month, please download the attached PDF.
  
  This PDF invoice provides a breakdown of the services provided, payments received, and any applicable fees or deductions. You can download or print the invoice for your records.
  
  If you have any questions or require further details regarding your payout, please don't hesitate to contact our support team. We are here to assist you with any inquiries you may have.
  
  Thank you for being a valuable member of our platform, and we look forward to continuing our successful partnership.
  
  Regards,
  The PetHub Team`;
};

exports.RefundRequestCreatedEmail = (refundRequest) => {
  const floatPrice = parseFloat(refundRequest.orderItem.itemPrice).toFixed(2);
  return `
    Dear ${refundRequest.petBusiness.companyName},

    A customer has submitted a refund request with the following details

    - Customer ID: ${refundRequest.petOwnerId}
    - Order Item ID: ${refundRequest.orderItemId}
    - Item Name: ${refundRequest.orderItem.itemName}
    - Amount: $${floatPrice}
    
    - Reason: ${refundRequest.reason}
    
    We kindly request that you review this refund application at your earliest convenience and proceed with either approval or rejection based on your assessment. 
    
    Prompt handling of this request will ensure continued customer satisfaction and maintain the quality of service we strive for at PetHub.

    Regards,
    The PetHub Team
  `;
};

exports.RefundRequestRejectedEmail = (refundRequest) => {
  const floatPrice = parseFloat(refundRequest.orderItem.itemPrice).toFixed(2);
  return `
    Dear ${refundRequest.petOwner.lastName} Team,

    Greetings from PetHub! We regret to inform you that the your refund request has been rejected based on the following details:

    - Item Name: ${refundRequest.orderItem.itemName}
    - Requested Refund Amount: $${floatPrice}
    - Reason for Rejection: ${refundRequest.comment}

    We understand that this may be disappointing. If you have any further questions or believe additional discussion is warranted, please do not hesitate to contact us.

    Thank you for your understanding, and we hope to continue serving your pet needs in the future.

    Warm regards,
    The PetHub Team
  `;
};

exports.RefundRequestApprovedEmail = (refundRequest) => {
  const floatPrice = parseFloat(refundRequest.orderItem.itemPrice).toFixed(2);
  return `
    Dear ${refundRequest.petOwner.lastName},

    Greetings from PetHub! We are reaching out to you regarding your recent refund request for the following item:

    - Item Name: ${refundRequest.orderItem.itemName}
    - Requested Refund Amount: $${floatPrice}

    We are pleased to inform you that your request has been accepted. Your refund is being processed and should be processed using your original payment method soon.

    Comments or Additional Information: ${refundRequest.comment}

    We appreciate your business and are committed to ensuring your satisfaction. If you have any further questions or need assistance, please feel free to reach out to us.

    Thank you for choosing PetHub.

    Best regards,
    The PetHub Team
  `;
};

exports.SupportClosedUnresolved = (name, supportTicket) => {
  return `
    Dear ${name},

    We hope this message finds you well.

    We wanted to inform you that your support ticket regarding ${supportTicket.reason} has been marked as closed due to inactivity. We value your feedback and want to ensure that your concerns are fully addressed.

    If you believe that your issue is not completely resolved or if you have any additional questions, you can easily reopen the support ticket by visiting our support page. Simply log in to your account and navigate to the support section, where you will find your closed tickets. Click on the relevant ticket and use the "Reopen" option to provide any additional comments or information.

    Here are some details from your support ticket:

    Support Ticket ID: ${supportTicket.supportTicketId}
    Status: ${supportTicket.status}
    Created At: ${supportTicket.createdAt}

    We appreciate your understanding and cooperation. Thank you for choosing PetHub for your support needs.

    Best regards,
    The PetHub Team
  `;
}

exports.SupportClosedResolved = (name, supportTicket) => {
  return `
    Dear ${name},

    We trust this message finds you well.

    We are pleased to inform you that your support ticket regarding ${supportTicket.reason} has been successfully resolved and is now closed. We hope that our assistance met your expectations, and your issue has been completely addressed.

    If you have any further questions or if there's anything else we can assist you with, please don't hesitate to reach out. Your satisfaction is our priority.

    Here are some details from your support ticket:

    Support Ticket ID: ${supportTicket.supportTicketId}
    Status: ${supportTicket.status}
    Created At: ${supportTicket.createdAt}

    We appreciate your patience and cooperation throughout this process. Thank you for choosing PetHub for your support needs.

    Best regards,
    The PetHub Team
  `;
}

