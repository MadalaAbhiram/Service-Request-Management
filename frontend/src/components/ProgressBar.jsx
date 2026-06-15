import "../styles/ProgressBar.css";

function ProgressBar({ status }) {
    function normalizeStatus(value) {
        const normalizedStatus = String(value || "").toLowerCase();
        if (normalizedStatus.includes("complete") || normalizedStatus.includes("resolved")) return "Resolved";
        if (normalizedStatus.includes("progress")) return "In Progress";
        return "Pending";
    }

    const steps = [
        "Pending",
        "In Progress",
        "Resolved"
    ];

    const currentStep = steps.indexOf(normalizeStatus(status));

    return (

        <div className="progress-container" aria-label={`Request progress: ${normalizeStatus(status)}`}>

            {
                steps.map((step, index) => (

                    <div
                        key={index}
                        className={
                            [
                                "progress-step",
                                index <= currentStep ? "active" : "",
                                index === currentStep ? "current" : ""
                            ].filter(Boolean).join(" ")
                        }
                    >

                        <div className="circle">
                            {index + 1}
                        </div>

                        <p>{step}</p>

                    </div>

                ))
            }

        </div>
    );
}

export default ProgressBar;
