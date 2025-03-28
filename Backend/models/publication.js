const mongo = require("mongoose");
const Schema = mongo.Schema;

const Publication = new Schema({
    // Référence à l'utilisateur qui a créé la publication
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true
    },
    // Type de publication : offre de compétence ou demande de compétence
    type: { 
        type: String, 
        enum: ['offer', 'request'], 
        required: true 
    },
    

    
    // Description détaillée
    description: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 1000 
    },
    
   
    
    // Date de création
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
    
 
    
  

   
});



module.exports = mongo.model('publications', Publication);