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
  return `
    Dear ${name},

    Thank you for your purchase at PetHub!

    We are pleased to inform you that your order has been successfully processed.

    Order Summary:
    - Invoice ID: ${invoice.invoiceId}
    - Payment ID: ${invoice.paymentId}

    Billing Details:
    - Subtotal: $${invoice.totalPrice - invoice.miscCharge}
    - Tax (7%): $${invoice.miscCharge}
    - Total Amount: $${invoice.totalPrice}

    You can view your order details and track the delivery status by clicking the following link: ${link}

    We appreciate your business and look forward to serving you again.

    Warm regards,
    The PetHub Team
`;
};

exports.POVoucherFulfillmentEmail = (orderItem) => {
  return `
    Dear ${orderItem.invoice.petOwner.firstName},

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
  return `
    Dear ${orderItem.serviceListing.petBusiness.companyName},

    Congratulations, a customer has successfully fulfilled an order for your service!

    Order Details:
    - Customer ID: ${orderItem.invoice.petOwnerUserId}
    - Order Item ID: ${orderItem.orderItemId}
    - Service Listing: ${orderItem.serviceListing.title}
    
    The amount will be credited to your Stripe business account at the end of this payout cycle. If you have any questions or need further assistance, please don't hesitate to file a support ticket on PetHub.

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
