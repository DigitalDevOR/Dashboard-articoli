import React from "react";

const CodiceInvito: React.FC<{ inviteCode: string; invitedPeople: number }> = ({ inviteCode= 'error', invitedPeople= 0 }) => {
    
    return (
        <>
            <div
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"

            >
                <div className="flex items-center">
                    <i className={`ri-group-line text-lg text-primary mr-3`}></i>
                    <span className="font-medium text-primary">Codice invito: <span className="font-mono">{inviteCode}</span></span>
                </div>
                <i className="text-gray-400 ri-arrow-right-s-line"></i>
            </div>
            <div
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"

            >
                <div className="flex items-center">
                    <i className={`ri-share-line text-lg text-primary mr-3`}></i>
                    <span className="font-medium text-primary">Persone invitate: <span className="font-mono">{invitedPeople}</span></span>
                </div>
                <i className="text-gray-400 ri-arrow-right-s-line"></i>
            </div>
        </>
    );
};

export default CodiceInvito;