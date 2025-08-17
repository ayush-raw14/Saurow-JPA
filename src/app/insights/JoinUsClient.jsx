"use client";

import styles from "./style.module.scss";
import Link from "next/link";
import Magnetic from "@/common/Magnetic/index";

export default function JoinUsClient() {
    return (
        <div className={styles.join}>
            <h1 className={styles.heading}>Join Our Team</h1>
            <p className={styles.description}>
                We believe in collaboration, creativity, and a passion for excellence. At our firm, you’ll work on exciting projects, learn from experienced professionals, and contribute to the financial success of our clients.
                <br /><br />
                If you’re driven, detail-oriented, and eager to grow — you’re in the right place.
            </p>

            <Magnetic><Link href="/contact" className={styles.contactLink}>
                Get in Touch
            </Link></Magnetic>
        </div>
    );
}
