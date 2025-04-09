from . import db


class AdditionalCost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    cost = db.Column(db.Float, nullable=False)
    
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=False)
    
    def __repr__(self) -> str:
        return f'<AdditionalCost {self.name}>' 
